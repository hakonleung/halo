import { useMutation, useQueryClient } from '@tanstack/react-query';
import { internalApiService } from '@/lib/internal-api';

/**
 * Hook for user logout
 * Returns mutation function and state from React Query
 */
export function useLogout() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => internalApiService.logout(),
    onSuccess: () => {
      // Clear query cache
      void queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });

  return {
    logout: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
