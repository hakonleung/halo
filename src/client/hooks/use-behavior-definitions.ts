import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BehaviorDefinitionCreateRequest } from '@/client/types/behavior-client';
import { createToaster } from '@chakra-ui/react';
import { internalApiService } from '@/client/internal-api';

const toaster = createToaster({
  placement: 'bottom-end',
});

/**
 * Hook to get behavior definitions
 */
export function useBehaviorDefinitions() {
  const {
    data: definitions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['behavior-definitions'],
    queryFn: () => internalApiService.getBehaviorDefinitions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    definitions: definitions ?? [],
    isLoading,
    error: error?.message ?? null,
  };
}

/**
 * Hook to create a behavior definition
 */
export function useCreateBehaviorDefinition() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (definition: BehaviorDefinitionCreateRequest) =>
      internalApiService.createBehaviorDefinition(definition),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['behavior-definitions'] });
      toaster.create({
        title: 'Success',
        description: 'Behavior definition created successfully.',
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
    createDefinition: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

/**
 * Hook to update a behavior definition
 */
export function useUpdateBehaviorDefinition() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<BehaviorDefinitionCreateRequest>;
    }) => internalApiService.updateBehaviorDefinition(id, updates),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['behavior-definitions'] });
      toaster.create({
        title: 'Success',
        description: 'Behavior definition updated successfully.',
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
    updateDefinition: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
