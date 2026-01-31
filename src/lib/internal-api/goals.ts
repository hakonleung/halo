/**
 * Goals API
 */

import { BaseApiService, type ApiResponse } from './base';
import type {
  Goal as ServerGoal,
  GoalCreateRequest as ServerGoalCreateRequest,
} from '@/types/goal-server';
import type {
  Goal as ClientGoal,
  GoalCreateRequest as ClientGoalCreateRequest,
  GoalProgress,
  GoalCategory,
} from '@/types/goal-client';

function convertGoal(server: ServerGoal): ClientGoal {
  return {
    id: server.id,
    userId: server.user_id,
    name: server.name,
    description: server.description ?? undefined,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    category: server.category as GoalCategory,
    startDate: server.start_date,
    endDate: server.end_date ?? undefined,
    criteria: server.criteria.map((c) => ({
      behaviorId: c.behavior_id,
      metric: c.metric,
      operator: c.operator,
      value: c.value,
      period: c.period,
      description: c.description,
    })),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    status: (server.status ?? 'active') as ClientGoal['status'],
    createdAt: server.created_at ?? new Date().toISOString(),
    updatedAt: server.updated_at ?? new Date().toISOString(),
  };
}

// Export converters for reuse in other modules
export { convertGoal };

export const goalsApi = {
  /**
   * Get goals list
   */
  async getGoals(params?: {
    status?: 'active' | 'completed' | 'abandoned';
    category?: string;
    sort?: 'created_at' | 'name';
    order?: 'asc' | 'desc';
  }): Promise<ClientGoal[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.order) searchParams.set('order', params.order);

    const url = `/api/goals${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await BaseApiService.fetchApi<ApiResponse<ServerGoal[]>>(url);

    if (!response.data) {
      throw new Error(response.error || 'Failed to fetch goals');
    }

    return response.data.map(convertGoal);
  },

  /**
   * Get a single goal
   */
  async getGoal(goalId: string): Promise<ClientGoal & { progress?: GoalProgress }> {
    const response = await BaseApiService.fetchApi<
      ApiResponse<ServerGoal & { progress?: GoalProgress }>
    >(`/api/goals/${goalId}`);

    if (!response.data) {
      throw new Error(response.error || 'Failed to fetch goal');
    }

    const { progress, ...goalData } = response.data;
    return {
      ...convertGoal(goalData),
      progress,
    };
  },

  /**
   * Create a goal
   */
  async createGoal(goal: ClientGoalCreateRequest): Promise<ClientGoal> {
    // API route expects camelCase, not snake_case
    const apiRequest = {
      name: goal.name,
      description: goal.description,
      category: goal.category,
      startDate: goal.startDate,
      endDate: goal.endDate,
      criteria: goal.criteria.map((c) => ({
        behaviorId: c.behaviorId,
        metric: c.metric,
        operator: c.operator,
        value: c.value,
        period: c.period,
        description: c.description,
      })),
    };

    const response = await BaseApiService.fetchApi<ApiResponse<ServerGoal>>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(apiRequest),
    });

    if (!response.data) {
      throw new Error(response.error || 'Failed to create goal');
    }

    return convertGoal(response.data);
  },

  /**
   * Update a goal
   */
  async updateGoal(
    id: string,
    updates: Partial<ClientGoalCreateRequest> & { status?: 'active' | 'completed' | 'abandoned' },
  ): Promise<ClientGoal> {
    const serverRequest: Partial<ServerGoalCreateRequest> & { status?: string } = {};

    if (updates.name !== undefined) serverRequest.name = updates.name;
    if (updates.description !== undefined) serverRequest.description = updates.description;
    if (updates.category !== undefined) serverRequest.category = updates.category;
    if (updates.startDate !== undefined) serverRequest.start_date = updates.startDate;
    if (updates.endDate !== undefined) serverRequest.end_date = updates.endDate;
    if (updates.criteria !== undefined) {
      serverRequest.criteria = updates.criteria.map((c) => ({
        behavior_id: c.behaviorId,
        metric: c.metric,
        operator: c.operator,
        value: c.value,
        period: c.period,
        description: c.description,
      }));
    }
    if (updates.status !== undefined) serverRequest.status = updates.status;

    const response = await BaseApiService.fetchApi<ApiResponse<ServerGoal>>(`/api/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(serverRequest),
    });

    if (!response.data) {
      throw new Error(response.error || 'Failed to update goal');
    }

    return convertGoal(response.data);
  },

  /**
   * Delete a goal
   */
  async deleteGoal(goalId: string): Promise<void> {
    const response = await BaseApiService.fetchApi<ApiResponse<null>>(`/api/goals/${goalId}`, {
      method: 'DELETE',
    });

    if (response.error) {
      throw new Error(response.error);
    }
  },
};
