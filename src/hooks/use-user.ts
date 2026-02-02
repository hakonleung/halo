import { useQuery } from '@tanstack/react-query';
import { internalApiService } from '@/lib/internal-api';

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
    queryFn: () => internalApiService.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const user = authData?.data.user ?? null;
  const errorMessage = error?.message ?? null;
  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    isLoading,
    error: errorMessage,
  };
}
