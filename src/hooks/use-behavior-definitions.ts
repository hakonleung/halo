import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  BehaviorDefinition,
  BehaviorDefinitionCreateRequest,
  BehaviorResponse,
} from '@/types/behavior-client';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
  placement: 'bottom-end',
});

/**
 * Hook to get behavior definitions
 */
export function useBehaviorDefinitions() {
  const {
    data: definitionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['behavior-definitions'],
    queryFn: async () => {
      const res = await fetch('/api/behaviors/definitions');
      if (!res.ok) {
        throw new Error('Failed to fetch behavior definitions');
      }
      return res.json() as Promise<BehaviorResponse<BehaviorDefinition[]>>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    definitions: definitionsData?.data ?? [],
    isLoading,
    error: error?.message ?? definitionsData?.error ?? null,
  };
}

/**
 * Hook to create a behavior definition
 */
export function useCreateBehaviorDefinition() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (definition: BehaviorDefinitionCreateRequest) => {
      const res = await fetch('/api/behaviors/definitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(definition),
      });
      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ error: 'Failed to create behavior definition' }));
        throw new Error(error.error || 'Failed to create behavior definition');
      }
      return res.json() as Promise<BehaviorResponse<BehaviorDefinition>>;
    },
    onSuccess: (res) => {
      if (res.data) {
        void queryClient.invalidateQueries({ queryKey: ['behavior-definitions'] });
        toaster.create({
          title: 'Success',
          description: 'Behavior definition created successfully.',
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
    createDefinition: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? mutation.data?.error ?? null,
  };
}
