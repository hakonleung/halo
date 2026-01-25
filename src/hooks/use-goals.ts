import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Goal, GoalCreateRequest } from '@/types/goal-client';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
  placement: 'bottom-end',
});

export interface GetGoalsParams {
  status?: 'active' | 'completed' | 'abandoned';
  category?: string;
  sort?: 'created_at' | 'name';
  order?: 'asc' | 'desc';
}

interface GoalResponse {
  data: Goal[] | Goal | null;
  error: string | null;
}

/**
 * Hook to get goals list
 */
export function useGoals(params?: GetGoalsParams) {
  const queryKey = ['goals', params];
  const {
    data: goalsData,
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.category) searchParams.set('category', params.category);
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.order) searchParams.set('order', params.order);

      const url = `/api/goals${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch goals');
      }
      return res.json() as Promise<GoalResponse>;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    goals: (goalsData?.data as Goal[]) ?? [],
    isLoading,
    error: error?.message ?? goalsData?.error ?? null,
  };
}

/**
 * Hook to get a single goal
 */
export function useGoal(goalId: string | null) {
  const {
    data: goalData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['goals', goalId],
    queryFn: async () => {
      if (!goalId) return null;
      const res = await fetch(`/api/goals/${goalId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch goal');
      }
      return res.json() as Promise<GoalResponse & { data: Goal & { progress?: { current: number; target: number; progress: number; isCompleted: boolean; remainingDays?: number } } }>;
    },
    enabled: !!goalId,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    goal: goalData?.data ?? null,
    isLoading,
    error: error?.message ?? goalData?.error ?? null,
  };
}

/**
 * Hook to create a goal
 */
export function useCreateGoal() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (goal: GoalCreateRequest) => {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to create goal' }));
        throw new Error(error.error || 'Failed to create goal');
      }
      return res.json() as Promise<GoalResponse>;
    },
    onSuccess: (res) => {
      if (res.data) {
        void queryClient.invalidateQueries({ queryKey: ['goals'] });
        toaster.create({
          title: 'Success',
          description: 'Goal created successfully.',
          type: 'success',
        });
      } else if (res.error) {
        toaster.create({
          title: 'Error',
          description: res.error,
          type: 'error',
        });
      }
    },
    onError: (error: Error) => {
      toaster.create({
        title: 'Error',
        description: error.message,
        type: 'error',
      });
    },
  });

  return {
    createGoal: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? mutation.data?.error ?? null,
  };
}

/**
 * Hook to update a goal
 */
export function useUpdateGoal() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<GoalCreateRequest> & { status?: 'active' | 'completed' | 'abandoned' } }) => {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to update goal' }));
        throw new Error(error.error || 'Failed to update goal');
      }
      return res.json() as Promise<GoalResponse>;
    },
    onSuccess: (res, variables) => {
      if (res.data) {
        void queryClient.invalidateQueries({ queryKey: ['goals'] });
        void queryClient.invalidateQueries({ queryKey: ['goals', variables.id] });
        toaster.create({
          title: 'Success',
          description: 'Goal updated successfully.',
          type: 'success',
        });
      } else if (res.error) {
        toaster.create({
          title: 'Error',
          description: res.error,
          type: 'error',
        });
      }
    },
    onError: (error: Error) => {
      toaster.create({
        title: 'Error',
        description: error.message,
        type: 'error',
      });
    },
  });

  return {
    updateGoal: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? mutation.data?.error ?? null,
  };
}

/**
 * Hook to delete a goal
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to delete goal' }));
        throw new Error(error.error || 'Failed to delete goal');
      }
      return res.json() as Promise<{ error: string | null }>;
    },
    onSuccess: (res) => {
      if (!res.error) {
        void queryClient.invalidateQueries({ queryKey: ['goals'] });
        toaster.create({
          title: 'Goal deleted',
          type: 'info',
        });
      } else {
        toaster.create({
          title: 'Error',
          description: res.error,
          type: 'error',
        });
      }
    },
    onError: (error: Error) => {
      toaster.create({
        title: 'Error',
        description: error.message,
        type: 'error',
      });
    },
  });

  return {
    deleteGoal: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

