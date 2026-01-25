import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SettingsUpdateRequest, SettingsResponse } from '@/types/settings-client';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
  placement: 'top',
});

/**
 * Hook for updating user settings
 * Returns mutation function and state from React Query
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (updates: SettingsUpdateRequest) => {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to update settings' }));
        throw new Error(error.error || 'Failed to update settings');
      }
      return res.json() as Promise<SettingsResponse>;
    },
    onSuccess: (res) => {
      if (res.settings) {
        // Revalidate settings query to sync data
        void queryClient.invalidateQueries({ queryKey: ['user-settings'] });
        // Show success toast
        toaster.create({
          title: 'Settings saved',
          description: 'Your settings have been updated successfully.',
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
        description: error.message || 'Failed to update settings',
        type: 'error',
      });
    },
  });

  return {
    updateSettings: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? mutation.data?.error ?? null,
  };
}
