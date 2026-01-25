import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthResponse } from '@/types/auth';
import { encryptPassword } from '@/utils/crypto';

/**
 * Hook for user signup
 * Returns mutation function and state from React Query
 */
export function useSignup() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // Encrypt password on client side
      const encryptedPassword = encryptPassword(password);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, encryptedPassword }),
      });
      return res.json() as Promise<AuthResponse>;
    },
    onSuccess: (res) => {
      if (res.user) {
        // Revalidate current user query to sync data
        void queryClient.invalidateQueries({ queryKey: ['current-user'] });
      }
    },
  });

  return {
    signup: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? mutation.data?.error ?? null,
  };
}
