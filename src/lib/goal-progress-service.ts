import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import type { Goal, GoalCriteria, GoalProgress } from '@/types/goal-server';

/**
 * Calculate date range based on period
 */
function getDateRange(period: 'daily' | 'weekly' | 'monthly', startDate: string, endDate?: string) {
  const now = new Date();
  const start = new Date(startDate);
  let rangeStart: Date;
  let rangeEnd: Date = endDate ? new Date(endDate) : now;

  switch (period) {
    case 'daily':
      rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      rangeEnd = now;
      break;
    case 'weekly':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      rangeStart = weekStart;
      rangeEnd = now;
      break;
    case 'monthly':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      rangeStart = monthStart;
      rangeEnd = now;
      break;
    default:
      rangeStart = start;
      rangeEnd = endDate ? new Date(endDate) : now;
  }

  // Ensure range doesn't exceed goal's date range
  if (rangeStart < start) rangeStart = start;
  if (endDate && rangeEnd > new Date(endDate)) rangeEnd = new Date(endDate);

  return { start: rangeStart, end: rangeEnd };
}

/**
 * Calculate metric value from behavior records
 */
async function calculateMetric(
  supabase: SupabaseClient<Database>,
  userId: string,
  behaviorId: string,
  metric: 'count' | 'sum' | 'avg',
  startDate: Date,
  endDate: Date
): Promise<number> {
  const { data: records, error } = await supabase
    .from('neolog_behavior_records')
    .select('metadata, recorded_at')
    .eq('user_id', userId)
    .eq('definition_id', behaviorId)
    .gte('recorded_at', startDate.toISOString())
    .lte('recorded_at', endDate.toISOString());

  if (error || !records || records.length === 0) {
    return 0;
  }

  switch (metric) {
    case 'count':
      return records.length;
    case 'sum':
      // Sum numeric values from metadata
      return records.reduce((sum, record) => {
        const metadata = record.metadata as Record<string, unknown>;
        const values = Object.values(metadata).filter((v) => typeof v === 'number') as number[];
        return sum + values.reduce((a, b) => a + b, 0);
      }, 0);
    case 'avg':
      // Average numeric values from metadata
      const numericValues: number[] = [];
      records.forEach((record) => {
        const metadata = record.metadata as Record<string, unknown>;
        const values = Object.values(metadata).filter((v) => typeof v === 'number') as number[];
        numericValues.push(...values);
      });
      if (numericValues.length === 0) return 0;
      return numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
    default:
      return 0;
  }
}

// Note: isCriteriaMet function is reserved for future use when checking individual criteria completion

/**
 * Goal Progress Service - Calculate goal progress
 */
export const goalProgressService = {
  /**
   * Calculate progress for a single goal
   */
  async calculateProgress(
    supabase: SupabaseClient<Database>,
    userId: string,
    goal: Goal
  ): Promise<GoalProgress> {
    if (!goal.criteria || goal.criteria.length === 0) {
      return {
        current: 0,
        target: 0,
        progress: 0,
        isCompleted: false,
      };
    }

    // Calculate progress for each criteria
    const criteriaProgress: number[] = [];
    let totalTarget = 0;
    let totalCurrent = 0;

    for (const criterion of goal.criteria as GoalCriteria[]) {
      const { start, end } = getDateRange(
        criterion.period,
        goal.start_date,
        goal.end_date ?? undefined
      );

      const currentValue = await calculateMetric(
        supabase,
        userId,
        criterion.behavior_id,
        criterion.metric,
        start,
        end
      );

      const targetValue = criterion.value;
      totalTarget += targetValue;
      totalCurrent += Math.min(currentValue, targetValue); // Cap at target

      // Calculate progress for this criterion (0-100)
      const criterionProgress = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
      criteriaProgress.push(Math.min(criterionProgress, 100));
    }

    // Overall progress is the minimum of all criteria (all must be met)
    const overallProgress = criteriaProgress.length > 0 ? Math.min(...criteriaProgress) : 0;

    // Check if all criteria are met
    const allCriteriaMet = criteriaProgress.every((p) => p >= 100);

    // Calculate remaining days
    let remainingDays: number | undefined;
    if (goal.end_date) {
      const endDate = new Date(goal.end_date);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      remainingDays = Math.ceil(diff / (24 * 60 * 60 * 1000));
      if (remainingDays < 0) remainingDays = 0;
    }

    return {
      current: totalCurrent,
      target: totalTarget,
      progress: Math.round(overallProgress),
      isCompleted: allCriteriaMet,
      remainingDays,
    };
  },

  /**
   * Calculate progress for multiple goals (batch)
   */
  async calculateBatchProgress(
    supabase: SupabaseClient<Database>,
    userId: string,
    goals: Goal[]
  ): Promise<Map<string, GoalProgress>> {
    const progressMap = new Map<string, GoalProgress>();

    // Calculate progress for each goal
    for (const goal of goals) {
      const progress = await this.calculateProgress(supabase, userId, goal);
      progressMap.set(goal.id, progress);
    }

    return progressMap;
  },
};

