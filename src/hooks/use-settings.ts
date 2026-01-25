import { useQuery } from '@tanstack/react-query';
import type { SettingsResponse } from '@/types/settings-client';

/**
 * Hook to get user settings
 * Returns settings data, loading state, and error from React Query
 */
export function useSettings() {
  const {
    data: settingsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      return res.json() as Promise<SettingsResponse>;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const settings = settingsData?.settings ?? null;
  const errorMessage = error?.message ?? settingsData?.error ?? null;

  return {
    settings,
    isLoading,
    error: errorMessage,
  };
}
