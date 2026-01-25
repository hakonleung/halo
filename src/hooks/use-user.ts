import { useQuery } from '@tanstack/react-query';
import type { AuthResponse } from '@/types/auth';

/**
 * Hook to get current user
 * Returns user data, loading state, and error from React Query
 */
export function useUser() {
  const {
    data: authData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      return res.json() as Promise<AuthResponse>;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const user = authData?.user ?? null;
  const errorMessage = error?.message ?? authData?.error ?? null;
  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    isLoading,
    error: errorMessage,
  };
}
