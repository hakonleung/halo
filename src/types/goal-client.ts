// Client-side types for goals
export interface GoalCriteria {
  behaviorId: string;
  metric: 'count' | 'sum' | 'avg';
  operator: '>' | '>=' | '<' | '<=' | '==';
  value: number;
  period: 'daily' | 'weekly' | 'monthly';
  description: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  startDate: string;
  endDate?: string;
  criteria: GoalCriteria[];
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

export interface GoalCreateRequest {
  name: string;
  description?: string;
  category: string;
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

