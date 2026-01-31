// Client-side types for goals
export enum GoalMetric {
  Count = 'count',
  Sum = 'sum',
  Avg = 'avg',
}

export enum GoalOperator {
  GreaterThan = '>',
  GreaterThanOrEqual = '>=',
  LessThan = '<',
  LessThanOrEqual = '<=',
  Equal = '==',
}

export enum GoalPeriod {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
}

export enum GoalStatus {
  Active = 'active',
  Completed = 'completed',
  Abandoned = 'abandoned',
}

export enum GoalCategory {
  Health = 'health',
  Finance = 'finance',
  Habit = 'habit',
  Learning = 'learning',
  Other = 'other',
}

export interface GoalCriteria {
  behaviorId: string;
  metric: GoalMetric;
  operator: GoalOperator;
  value: number;
  period: GoalPeriod;
  description: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: GoalCategory;
  startDate: string;
  endDate?: string;
  criteria: GoalCriteria[];
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GoalCreateRequest {
  name: string;
  description?: string;
  category: GoalCategory;
  startDate: string;
  endDate?: string;
  criteria: GoalCriteria[];
}

export interface GoalProgress {
  current: number;
  target: number;
  progress: number; // 0-100
  isCompleted: boolean;
  remainingDays?: number;
}
