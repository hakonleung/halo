import { createToaster } from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { internalApiService } from '@/client/internal-api';

import type { BehaviorRecordCreateRequest } from '@/client/types/behavior-client';

const toaster = createToaster({
  placement: 'bottom-end',
});

/**
 * Hook to get behavior records with pagination
 */
export function useBehaviorRecords(limit = 50, offset = 0) {
  const {
    data: records,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['behavior-records', limit, offset],
    queryFn: () => internalApiService.getBehaviorRecords(limit, offset),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    records: records ?? [],
    isLoading,
    error: error?.message ?? null,
  };
}

/**
 * Hook to create a behavior record
 */
export function useCreateBehaviorRecord() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (record: BehaviorRecordCreateRequest) =>
      internalApiService.createBehaviorRecord(record),
    onSuccess: () => {
      // Invalidate both records and definitions (to update usage count)
      void queryClient.invalidateQueries({ queryKey: ['behavior-records'] });
      void queryClient.invalidateQueries({ queryKey: ['behavior-definitions'] });
      // Invalidate dashboard queries to refresh stats, trends, and heatmap
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toaster.create({
        title: 'Success',
        description: 'Record saved successfully.',
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
    createRecord: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

/**
 * Hook to update a behavior record
 */
export function useUpdateBehaviorRecord() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BehaviorRecordCreateRequest> }) =>
      internalApiService.updateBehaviorRecord(id, updates),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['behavior-records'] });
      void queryClient.invalidateQueries({ queryKey: ['behavior-definitions'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toaster.create({
        title: 'Success',
        description: 'Record updated successfully.',
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
    updateRecord: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

/**
 * Hook to delete a behavior record
 */
export function useDeleteBehaviorRecord() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (recordId: string) => internalApiService.deleteBehaviorRecord(recordId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['behavior-records'] });
      toaster.create({
        title: 'Record deleted',
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
    deleteRecord: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
