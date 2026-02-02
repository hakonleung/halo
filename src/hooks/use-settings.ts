import { useQuery } from '@tanstack/react-query';
import { internalApiService } from '@/lib/internal-api';

/**
 * Hook to get user settings
 * Returns settings data, loading state, and error from React Query
 */
export function useSettings() {
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user-settings'],
    queryFn: () => internalApiService.getSettings(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  return {
    settings: settings ?? null,
    isLoading,
    error: error?.message ?? null,
  };
}
