import { useMutation, useQueryClient } from '@tanstack/react-query';
import { encryptPassword } from '@/client/utils/crypto';
import { internalApiService } from '@/client/internal-api';

/**
 * Hook for user login
 * Returns mutation function and state from React Query
 */
export function useLogin() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // Encrypt password on client side
      const encryptedPassword = encryptPassword(password);
      return internalApiService.login(email, encryptedPassword);
    },
    onSuccess: (res) => {
      if (res.user) {
        // Revalidate current user query to sync data
        void queryClient.invalidateQueries({ queryKey: ['current-user'] });
      }
    },
  });

  return {
    login: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? mutation.data?.error ?? null,
  };
}
