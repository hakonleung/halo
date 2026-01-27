import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GoalCreateRequest } from '@/types/goal-client';
import { createToaster } from '@chakra-ui/react';
import { internalApiService } from '@/lib/internal-api';

const toaster = createToaster({
  placement: 'bottom-end',
});

export interface GetGoalsParams {
  status?: 'active' | 'completed' | 'abandoned';
  category?: string;
  sort?: 'created_at' | 'name';
  order?: 'asc' | 'desc';
}

/**
 * Hook to get goals list
 */
export function useGoals(params?: GetGoalsParams) {
  const queryKey = ['goals', params];
  const {
    data: goals,
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => internalApiService.getGoals(params),
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    goals: goals ?? [],
    isLoading,
    error: error?.message ?? null,
  };
}

/**
 * Hook to get a single goal
 */
export function useGoal(goalId: string | null) {
  const {
    data: goal,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['goals', goalId],
    queryFn: () => {
      if (!goalId) throw new Error('Goal ID is required');
      return internalApiService.getGoal(goalId);
    },
    enabled: !!goalId,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    goal: goal ?? null,
    isLoading,
    error: error?.message ?? null,
  };
}

/**
 * Hook to create a goal
 */
export function useCreateGoal() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (goal: GoalCreateRequest) => internalApiService.createGoal(goal),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['goals'] });
      toaster.create({
        title: 'Success',
        description: 'Goal created successfully.',
        type: 'success',
      });
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
    error: mutation.error?.message ?? null,
  };
}

/**
 * Hook to update a goal
 */
export function useUpdateGoal() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<GoalCreateRequest> & { status?: 'active' | 'completed' | 'abandoned' };
    }) => internalApiService.updateGoal(id, updates),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['goals'] });
      void queryClient.invalidateQueries({ queryKey: ['goals', variables.id] });
      toaster.create({
        title: 'Success',
        description: 'Goal updated successfully.',
        type: 'success',
      });
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
    error: mutation.error?.message ?? null,
  };
}

/**
 * Hook to delete a goal
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (goalId: string) => internalApiService.deleteGoal(goalId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['goals'] });
      toaster.create({
        title: 'Goal deleted',
        type: 'info',
      });
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
