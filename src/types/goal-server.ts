import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { neologGoals } from '@/db/schema';

// Server-side types for goals (Inferred from Drizzle Entity)
export type Goal = InferSelectModel<typeof neologGoals> & {
  criteria: GoalCriteria[];
};

export interface GoalCriteria {
  behavior_id: string;
  metric: 'count' | 'sum' | 'avg';
  operator: '>' | '>=' | '<' | '<=' | '==';
  value: number;
  period: 'daily' | 'weekly' | 'monthly';
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
