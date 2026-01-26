import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  BehaviorRecord,
  BehaviorRecordWithDefinition,
  BehaviorRecordCreateRequest,
  BehaviorResponse,
} from '@/types/behavior-client';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
  placement: 'bottom-end',
});

/**
 * Hook to get behavior records with pagination
 */
export function useBehaviorRecords(limit = 50, offset = 0) {
  const {
    data: recordsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['behavior-records', limit, offset],
    queryFn: async () => {
      const res = await fetch(`/api/behaviors/records?limit=${limit}&offset=${offset}`);
      if (!res.ok) {
        throw new Error('Failed to fetch behavior records');
      }
      return res.json() as Promise<BehaviorResponse<BehaviorRecordWithDefinition[]>>;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    records: recordsData?.data ?? [],
    isLoading,
    error: error?.message ?? recordsData?.error ?? null,
  };
}

/**
 * Hook to create a behavior record
 */
export function useCreateBehaviorRecord() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (record: BehaviorRecordCreateRequest) => {
      const res = await fetch('/api/behaviors/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to create behavior record' }));
        throw new Error(error.error || 'Failed to create behavior record');
      }
      return res.json() as Promise<BehaviorResponse<BehaviorRecord>>;
    },
    onSuccess: (res) => {
      if (res.data) {
        // Invalidate both records and definitions (to update usage count)
        void queryClient.invalidateQueries({ queryKey: ['behavior-records'] });
        void queryClient.invalidateQueries({ queryKey: ['behavior-definitions'] });
        toaster.create({
          title: 'Success',
          description: 'Record saved successfully.',
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
    createRecord: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? mutation.data?.error ?? null,
  };
}

/**
 * Hook to delete a behavior record
 */
export function useDeleteBehaviorRecord() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (recordId: string) => {
      const res = await fetch(`/api/behaviors/records/${recordId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to delete record' }));
        throw new Error(error.error || 'Failed to delete record');
      }
      return res.json() as Promise<{ error: string | null }>;
    },
    onSuccess: (res) => {
      if (!res.error) {
        void queryClient.invalidateQueries({ queryKey: ['behavior-records'] });
        toaster.create({
          title: 'Record deleted',
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
    deleteRecord: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
