import { useQuery } from '@tanstack/react-query';
import type { TimeRange } from '@/client/types/dashboard-client';
import { internalApiService } from '@/client/internal-api';

/**
 * Hook for dashboard stats
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => internalApiService.getDashboardStats(),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for trend data
 */
export function useTrends(range: TimeRange, types?: string[]) {
  return useQuery({
    queryKey: ['dashboard', 'trends', range, types],
    queryFn: () => internalApiService.getTrends(range, types),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for heatmap data
 */
export function useHeatmap(months = 12) {
  return useQuery({
    queryKey: ['dashboard', 'heatmap', months],
    queryFn: () => internalApiService.getHeatmap(months),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
