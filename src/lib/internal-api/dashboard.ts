/**
 * Dashboard API
 */

import { BaseApiService, type ApiResponse } from './base';
import type {
  DashboardStatsModel,
  TrendDataModel,
  HeatmapDataModel,
} from '@/types/dashboard-server';
import type {
  DashboardStats,
  TrendData,
  TrendPoint,
  HeatmapData,
  HeatmapLevel,
} from '@/types/dashboard-client';

// Dashboard types are already compatible (no Date conversion needed)
function convertDashboardStats(server: DashboardStatsModel): DashboardStats {
  return server;
}

/**
 * Calculate heatmap level based on count
 */
function calculateLevel(count: number): HeatmapLevel {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

/**
 * Process trend records with local timezone and fill all dates
 */
function processTrendData(server: TrendDataModel): TrendData {
  const { records, types, start, end } = server;

  // Convert start and end to local timezone dates
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Group records by date in local timezone
  const dateMap = new Map<string, { total: number; byType: Record<string, number> }>();

  // First, fill all dates in range
  const allDates: string[] = [];
  let currentDate = new Date(startDate);

  // Get end date string in local timezone for comparison
  const endDateStr = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(endDate);

  while (true) {
    const dateStr = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(currentDate);

    allDates.push(dateStr);
    dateMap.set(dateStr, { total: 0, byType: {} });

    // Check if we've reached the end date
    if (dateStr >= endDateStr) break;

    // Move to next day
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Then, count records by date
  for (const record of records) {
    // Convert to local timezone date string
    const date = new Date(record.recorded_at);
    const dateStr = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);

    const entry = dateMap.get(dateStr);
    if (entry) {
      entry.total++;
      entry.byType[record.definition_id] = (entry.byType[record.definition_id] || 0) + 1;
    }
  }

  // Convert to array and sort (already sorted by date)
  const points: TrendPoint[] = allDates.map((date) => {
    const data = dateMap.get(date) || { total: 0, byType: {} };
    return { date, ...data };
  });

  return {
    points,
    types,
  };
}

/**
 * Process heatmap records with local timezone and fill all dates
 */
function processHeatmapData(server: HeatmapDataModel): HeatmapData[] {
  const { records, start, end } = server;

  // Convert start and end to local timezone dates
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Count by date in local timezone
  const countMap = new Map<string, number>();

  // First, fill all dates in range
  const allDates: string[] = [];
  let currentDate = new Date(startDate);

  // Get end date string in local timezone for comparison
  const endDateStr = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(endDate);

  while (true) {
    const dateStr = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(currentDate);

    allDates.push(dateStr);
    countMap.set(dateStr, 0);

    // Check if we've reached the end date
    if (dateStr >= endDateStr) break;

    // Move to next day
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Then, count records by date
  for (const record of records) {
    // Convert to local timezone date string
    const date = new Date(record.recorded_at);
    const dateStr = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);

    countMap.set(dateStr, (countMap.get(dateStr) || 0) + 1);
  }

  // Convert to array (already sorted by date)
  const result: HeatmapData[] = allDates.map((date) => {
    const count = countMap.get(date) || 0;
    return {
      date,
      count,
      level: calculateLevel(count),
    };
  });

  return result;
}

export const dashboardApi = {
  /**
   * Get dashboard stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response =
      await BaseApiService.fetchApi<ApiResponse<DashboardStatsModel>>('/api/dashboard/stats');

    if (!response.data) {
      throw new Error(response.error || 'Failed to fetch dashboard stats');
    }

    return convertDashboardStats(response.data);
  },

  /**
   * Get trend data
   */
  async getTrends(
    range: { type: 'preset'; value: string } | { type: 'custom'; start: string; end: string },
    types?: string[],
  ): Promise<TrendData> {
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

    const response = await BaseApiService.fetchApi<ApiResponse<TrendDataModel>>(
      `/api/dashboard/trends?${params.toString()}`,
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to fetch trends');
    }

    return processTrendData(response.data);
  },

  /**
   * Get heatmap data
   */
  async getHeatmap(months: number): Promise<HeatmapData[]> {
    const response = await BaseApiService.fetchApi<ApiResponse<HeatmapDataModel>>(
      `/api/dashboard/heatmap?months=${months}`,
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to fetch heatmap');
    }

    return processHeatmapData(response.data);
  },
};
