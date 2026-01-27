/**
 * Dashboard API
 */

import { BaseApiService, type ApiResponse } from './base';
import type {
  DashboardStatsModel,
  TrendDataModel,
  HeatmapDataModel,
} from '@/types/dashboard-server';
import type { DashboardStats, TrendData, HeatmapData } from '@/types/dashboard-client';

// Dashboard types are already compatible (no Date conversion needed)
function convertDashboardStats(server: DashboardStatsModel): DashboardStats {
  return server;
}

function convertTrendData(server: TrendDataModel): TrendData {
  return server;
}

function convertHeatmapData(server: HeatmapDataModel[]): HeatmapData[] {
  return server;
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

    return convertTrendData(response.data);
  },

  /**
   * Get heatmap data
   */
  async getHeatmap(months: number): Promise<HeatmapData[]> {
    const response = await BaseApiService.fetchApi<ApiResponse<HeatmapDataModel[]>>(
      `/api/dashboard/heatmap?months=${months}`,
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to fetch heatmap');
    }

    return convertHeatmapData(response.data);
  },
};
