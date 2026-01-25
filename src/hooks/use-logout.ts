import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook for user logout
 * Returns mutation function and state from React Query
 */
export function useLogout() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      return res.json() as Promise<{ error: string | null }>;
    },
    onSuccess: () => {
      // Clear query cache
      void queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });

  return {
    logout: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? mutation.data?.error ?? null,
  };
}
