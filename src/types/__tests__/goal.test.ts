/**
 * Type tests for goal types
 * Tests type consistency between Server and Client types
 */

import type {
  Goal as ServerGoal,
  GoalCriteria as ServerGoalCriteria,
  GoalCreateRequest as ServerGoalCreateRequest,
  GoalProgress as ServerGoalProgress,
} from '../goal-server';
import type {
  Goal as ClientGoal,
  GoalCriteria as ClientGoalCriteria,
  GoalCreateRequest as ClientGoalCreateRequest,
  GoalProgress as ClientGoalProgress,
} from '../goal-client';
import { GoalMetric, GoalOperator, GoalPeriod, GoalStatus } from '../goal-client';

// Test Server GoalCriteria structure
const serverCriteria: ServerGoalCriteria = {
  behavior_id: 'test-behavior-id',
  metric: GoalMetric.Count,
  operator: GoalOperator.GreaterThanOrEqual,
  value: 100,
  period: GoalPeriod.Monthly,
  description: 'Test criteria',
};

// Test Client GoalCriteria structure
const clientCriteria: ClientGoalCriteria = {
  behaviorId: 'test-behavior-id',
  metric: GoalMetric.Count,
  operator: GoalOperator.GreaterThanOrEqual,
  value: 100,
  period: GoalPeriod.Monthly,
  description: 'Test criteria',
};

// Test Server Goal structure
const serverGoal: ServerGoal = {
  id: 'test-id',
  user_id: 'test-user-id',
  name: 'Test Goal',
  description: 'Test description',
  category: 'health',
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2026-12-31T23:59:59Z',
  criteria: [serverCriteria],
  status: GoalStatus.Active,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

// Test Client Goal structure
const clientGoal: ClientGoal = {
  id: 'test-id',
  userId: 'test-user-id',
  name: 'Test Goal',
  description: 'Test description',
  category: 'health',
  startDate: '2026-01-01T00:00:00Z',
  endDate: '2026-12-31T23:59:59Z',
  criteria: [clientCriteria],
  status: GoalStatus.Active,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

// Test Server GoalCreateRequest
const serverCreateRequest: ServerGoalCreateRequest = {
  name: 'Test Goal',
  description: 'Test description',
  category: 'health',
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2026-12-31T23:59:59Z',
  criteria: [serverCriteria],
};

// Test Client GoalCreateRequest
const clientCreateRequest: ClientGoalCreateRequest = {
  name: 'Test Goal',
  description: 'Test description',
  category: 'health',
  startDate: '2026-01-01T00:00:00Z',
  endDate: '2026-12-31T23:59:59Z',
  criteria: [clientCriteria],
};

// Test Server GoalProgress
const serverProgress: ServerGoalProgress = {
  current: 75,
  target: 100,
  progress: 75,
  isCompleted: false,
  remainingDays: 30,
};

// Test Client GoalProgress
const clientProgress: ClientGoalProgress = {
  current: 75,
  target: 100,
  progress: 75,
  isCompleted: false,
  remainingDays: 30,
};

// Type conversion functions (for runtime conversion)
export function convertServerGoalToClient(serverGoal: ServerGoal): ClientGoal {
  return {
    id: serverGoal.id,
    userId: serverGoal.user_id,
    name: serverGoal.name,
    description: serverGoal.description ?? undefined,
    category: serverGoal.category,
    startDate: serverGoal.start_date,
    endDate: serverGoal.end_date ?? undefined,
    criteria: serverGoal.criteria.map((c) => ({
      behaviorId: c.behavior_id,
      metric: c.metric,
      operator: c.operator,
      value: c.value,
      period: c.period,
      description: c.description,
    })),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    status: (serverGoal.status as GoalStatus) ?? GoalStatus.Active,
    createdAt: serverGoal.created_at ?? new Date().toISOString(),
    updatedAt: serverGoal.updated_at ?? new Date().toISOString(),
  };
}

export function convertClientGoalToServer(
  clientGoal: ClientGoal,
  userId: string,
): Omit<ServerGoal, 'id' | 'created_at' | 'updated_at'> & {
  description: string | null;
  end_date: string | null;
} {
  return {
    user_id: userId,
    name: clientGoal.name,
    description: clientGoal.description ?? null,
    category: clientGoal.category,
    start_date: clientGoal.startDate,
    end_date: clientGoal.endDate ?? null,
    criteria: clientGoal.criteria.map((c) => ({
      behavior_id: c.behaviorId,
      metric: c.metric,
      operator: c.operator,
      value: c.value,
      period: c.period,
      description: c.description,
    })),
    status: clientGoal.status,
  };
}

export function convertServerCriteriaToClient(
  serverCriteria: ServerGoalCriteria,
): ClientGoalCriteria {
  return {
    behaviorId: serverCriteria.behavior_id,
    metric: serverCriteria.metric,
    operator: serverCriteria.operator,
    value: serverCriteria.value,
    period: serverCriteria.period,
    description: serverCriteria.description,
  };
}

export function convertClientCriteriaToServer(
  clientCriteria: ClientGoalCriteria,
): ServerGoalCriteria {
  return {
    behavior_id: clientCriteria.behaviorId,
    metric: clientCriteria.metric,
    operator: clientCriteria.operator,
    value: clientCriteria.value,
    period: clientCriteria.period,
    description: clientCriteria.description,
  };
}

// Type assertions to ensure types are correct
export const typeTests = {
  serverCriteria,
  clientCriteria,
  serverGoal,
  clientGoal,
  serverCreateRequest,
  clientCreateRequest,
  serverProgress,
  clientProgress,
} as const;
