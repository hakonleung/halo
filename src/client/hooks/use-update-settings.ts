import { createToaster } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { internalApiService } from '@/client/internal-api';

import type { SettingsUpdateRequest } from '@/client/types/settings-client';

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
    mutationFn: (updates: SettingsUpdateRequest) => internalApiService.updateSettings(updates),
    onSuccess: () => {
      // Revalidate settings query to sync data
      void queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      // Show success toast
      toaster.create({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully.',
        type: 'success',
      });
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
    error: mutation.error?.message ?? null,
  };
}
