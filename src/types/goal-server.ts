import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { neologGoals } from '@/db/schema';
import { GoalMetric, GoalOperator, GoalPeriod, GoalStatus } from './goal-client';

// Re-export enums for server-side use
export { GoalMetric, GoalOperator, GoalPeriod, GoalStatus };

// Server-side types for goals (Inferred from Drizzle Entity)
export type Goal = InferSelectModel<typeof neologGoals> & {
  criteria: GoalCriteria[];
};

export interface GoalCriteria {
  behavior_id: string;
  metric: GoalMetric;
  operator: GoalOperator;
  value: number;
  period: GoalPeriod;
  description: string;
}

export type GoalCreateRequest = Partial<InferInsertModel<typeof neologGoals>> & {
  criteria: GoalCriteria[];
};

export interface GoalProgress {
  current: number;
  target: number;
  progress: number; // 0-100
  isCompleted: boolean;
  remainingDays?: number;
}
