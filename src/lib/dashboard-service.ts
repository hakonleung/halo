import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type {
  DashboardStatsModel,
  TrendDataModel,
  HeatmapDataModel,
  GetTrendsParams,
  GetHeatmapParams,
} from '@/types/dashboard-server';

// Color palette for behavior types
const TYPE_COLORS = [
  '#00FF41', // matrix green
  '#00D4FF', // cyber blue
  '#FF6B35', // alert orange
  '#FFD700', // gold
  '#FF3366', // neon red
  '#9B59B6', // purple
  '#1ABC9C', // teal
  '#E91E63', // pink
];

/**
 * Calculate heatmap level based on count
 */
function calculateLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

/**
 * Get date range based on preset
 */
function getDateRange(range: GetTrendsParams['range'], start?: string, end?: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'today':
      return { start: today, end: now };
    case '7d':
      return { start: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000), end: now };
    case '30d':
      return { start: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000), end: now };
    case '90d':
      return { start: new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000), end: now };
    case 'custom':
      if (!start || !end) throw new Error('Start and end dates required for custom range');
      return { start: new Date(start), end: new Date(end) };
    default:
      return { start: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000), end: now };
  }
}

/**
 * Dashboard service - Statistics and analytics
 */
export const dashboardService = {
  /**
   * Get dashboard overview stats
   */
  async getStats(
    supabase: SupabaseClient<Database>,
    userId: string,
  ): Promise<{ data: DashboardStatsModel | null; error: string | null }> {
    if (!userId) return { data: null, error: 'User ID is required' };

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayStr = today.toISOString();

      // Get today's records with definition names
      const { data: todayRecords, error: todayError } = await supabase
        .from('neolog_behavior_records')
        .select('id, definition_id, neolog_behavior_definitions(name)')
        .eq('user_id', userId)
        .gte('recorded_at', todayStr);

      if (todayError) throw todayError;

      // Aggregate today stats by type
      const typeCount: Record<string, { name: string; count: number }> = {};
      for (const record of todayRecords || []) {
        const defId = record.definition_id;

        const defName = record.neolog_behavior_definitions?.name || 'Unknown';
        if (!typeCount[defId]) {
          typeCount[defId] = { name: defName, count: 0 };
        }
        typeCount[defId].count++;
      }

      const todayStats = {
        total: todayRecords?.length || 0,
        byType: Object.entries(typeCount).map(([definitionId, { name, count }]) => ({
          definitionId,
          name,
          count,
        })),
      };

      // Calculate streak
      const { data: allDates, error: datesError } = await supabase
        .from('neolog_behavior_records')
        .select('recorded_at')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });

      if (datesError) throw datesError;

      // Get unique dates
      const uniqueDates = new Set<string>();
      for (const record of allDates || []) {
        const date = new Date(record.recorded_at).toISOString().split('T')[0];
        uniqueDates.add(date);
      }
      const sortedDates = Array.from(uniqueDates).sort((a, b) => b.localeCompare(a));

      // Calculate current streak
      let currentStreak = 0;
      const todayDateStr = today.toISOString().split('T')[0];
      let checkDate = new Date(today);

      // Start from today or yesterday
      if (!sortedDates.includes(todayDateStr)) {
        checkDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      }

      for (const dateStr of sortedDates) {
        const expectedDate = checkDate.toISOString().split('T')[0];
        if (dateStr === expectedDate) {
          currentStreak++;
          checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
        } else if (dateStr < expectedDate) {
          break;
        }
      }

      // Calculate longest streak (simplified)
      let longestStreak = currentStreak;
      let tempStreak = 0;
      let prevDate: Date | null = null;

      for (const dateStr of sortedDates) {
        const date = new Date(dateStr);
        if (prevDate === null) {
          tempStreak = 1;
        } else {
          const diff = (prevDate.getTime() - date.getTime()) / (24 * 60 * 60 * 1000);
          if (Math.abs(diff - 1) < 0.1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        prevDate = date;
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // Get goal rate
      const { data: goals, error: goalsError } = await supabase
        .from('neolog_goals')
        .select('id, status, criteria')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (goalsError) throw goalsError;

      // Simple goal rate calculation (percentage of active goals)
      const goalRate = {
        overall: goals?.length
          ? Math.round((goals.filter((g) => g.status === 'active').length / goals.length) * 100)
          : 0,
        change: 0, // Would need historical data to calculate
      };

      // Week comparison
      const thisWeekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
      const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastWeekEnd = new Date(thisWeekStart.getTime() - 1);

      const { count: thisWeekCount } = await supabase
        .from('neolog_behavior_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('recorded_at', thisWeekStart.toISOString());

      const { count: lastWeekCount } = await supabase
        .from('neolog_behavior_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('recorded_at', lastWeekStart.toISOString())
        .lte('recorded_at', lastWeekEnd.toISOString());

      const weekCompare = {
        thisWeek: thisWeekCount || 0,
        lastWeek: lastWeekCount || 0,
        change: lastWeekCount
          ? Math.round((((thisWeekCount || 0) - lastWeekCount) / lastWeekCount) * 100)
          : 0,
      };

      return {
        data: {
          today: todayStats,
          streak: { current: currentStreak, longest: longestStreak },
          goalRate,
          weekCompare,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : String(err) };
    }
  },

  /**
   * Get trend data for charts
   */
  async getTrends(
    supabase: SupabaseClient<Database>,
    userId: string,
    params: GetTrendsParams,
  ): Promise<{ data: TrendDataModel | null; error: string | null }> {
    if (!userId) return { data: null, error: 'User ID is required' };

    try {
      const { start, end } = getDateRange(params.range, params.start, params.end);

      // Get records in range
      let query = supabase
        .from('neolog_behavior_records')
        .select('recorded_at, definition_id')
        .eq('user_id', userId)
        .gte('recorded_at', start.toISOString())
        .lte('recorded_at', end.toISOString());

      if (params.types && params.types.length > 0) {
        query = query.in('definition_id', params.types);
      }

      const { data: records, error: recordsError } = await query;
      if (recordsError) throw recordsError;

      // Get behavior definitions
      const { data: definitions, error: defsError } = await supabase
        .from('neolog_behavior_definitions')
        .select('id, name')
        .or(`user_id.eq.${userId},user_id.is.null`);

      if (defsError) throw defsError;

      // Create type info with colors
      const typeMap = new Map<string, { id: string; name: string; color: string }>();
      definitions?.forEach((def, index) => {
        typeMap.set(def.id, {
          id: def.id,
          name: def.name,
          color: TYPE_COLORS[index % TYPE_COLORS.length],
        });
      });

      // Aggregate by date
      const dateMap = new Map<string, { total: number; byType: Record<string, number> }>();

      // Fill in all dates in range
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        dateMap.set(dateStr, { total: 0, byType: {} });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Count records
      for (const record of records || []) {
        const dateStr = new Date(record.recorded_at).toISOString().split('T')[0];
        const entry = dateMap.get(dateStr);
        if (entry) {
          entry.total++;
          entry.byType[record.definition_id] = (entry.byType[record.definition_id] || 0) + 1;
        }
      }

      // Convert to array
      const points = Array.from(dateMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Get unique types used
      const usedTypes = new Set<string>();
      for (const record of records || []) {
        usedTypes.add(record.definition_id);
      }

      return {
        data: {
          points,
          types: Array.from(usedTypes)
            .map((id) => typeMap.get(id))
            .filter((t): t is { id: string; name: string; color: string } => t !== undefined),
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : String(err) };
    }
  },

  /**
   * Get heatmap data
   */
  async getHeatmap(
    supabase: SupabaseClient<Database>,
    userId: string,
    params: GetHeatmapParams = {},
  ): Promise<{ data: HeatmapDataModel[] | null; error: string | null }> {
    if (!userId) return { data: null, error: 'User ID is required' };

    try {
      const months = params.months || 12;
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

      const { data: records, error } = await supabase
        .from('neolog_behavior_records')
        .select('recorded_at')
        .eq('user_id', userId)
        .gte('recorded_at', start.toISOString());

      if (error) throw error;

      // Count by date
      const countMap = new Map<string, number>();
      for (const record of records || []) {
        const dateStr = new Date(record.recorded_at).toISOString().split('T')[0];
        countMap.set(dateStr, (countMap.get(dateStr) || 0) + 1);
      }

      // Generate all dates in range
      const result: HeatmapDataModel[] = [];
      const currentDate = new Date(start);
      while (currentDate <= now) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = countMap.get(dateStr) || 0;
        result.push({
          date: dateStr,
          count,
          level: calculateLevel(count),
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return { data: result, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : String(err) };
    }
  },
};
