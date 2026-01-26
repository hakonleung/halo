import { useQuery } from '@tanstack/react-query';
import type { DashboardStats, TrendData, HeatmapData, TimeRange } from '@/types/dashboard-client';

/**
 * Fetch dashboard stats
 */
async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) {
    throw new Error('Failed to fetch stats');
  }
  const json = await res.json();
  return json.data;
}

/**
 * Fetch trend data
 */
async function fetchTrends(range: TimeRange, types?: string[]): Promise<TrendData> {
  const params = new URLSearchParams();

  if (range.type === 'preset') {
    params.set('range', range.value);
  } else {
    params.set('range', 'custom');
    params.set('start', range.start);
    params.set('end', range.end);
  }

  if (types && types.length > 0) {
    params.set('types', types.join(','));
  }

  const res = await fetch(`/api/dashboard/trends?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch trends');
  }
  const json = await res.json();
  return json.data;
}

/**
 * Fetch heatmap data
 */
async function fetchHeatmap(months: number): Promise<HeatmapData[]> {
  const res = await fetch(`/api/dashboard/heatmap?months=${months}`);
  if (!res.ok) {
    throw new Error('Failed to fetch heatmap');
  }
  const json = await res.json();
  return json.data;
}

/**
 * Hook for dashboard stats
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchStats,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for trend data
 */
export function useTrends(range: TimeRange, types?: string[]) {
  return useQuery({
    queryKey: ['dashboard', 'trends', range, types],
    queryFn: () => fetchTrends(range, types),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for heatmap data
 */
export function useHeatmap(months = 12) {
  return useQuery({
    queryKey: ['dashboard', 'heatmap', months],
    queryFn: () => fetchHeatmap(months),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for behaviors by date (for heatmap drill-down)
 */
export function useBehaviorsByDate(date: string | null) {
  return useQuery({
    queryKey: ['behaviors', 'byDate', date],
    queryFn: async () => {
      if (!date) return [];
      const res = await fetch(`/api/behaviors/records?date=${date}`);
      if (!res.ok) throw new Error('Failed to fetch behaviors');
      const json = await res.json();
      return json.data || [];
    },
    enabled: Boolean(date),
  });
}
