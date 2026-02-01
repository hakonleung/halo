// Server-side types for dashboard statistics

export enum DashboardRange {
  Today = 'today',
  Last7Days = '7d',
  Last30Days = '30d',
  Last90Days = '90d',
  Custom = 'custom',
}

// Request parameters
export interface GetTrendsParams {
  range: DashboardRange;
  start?: string;
  end?: string;
  types?: string[];
}

export interface GetHeatmapParams {
  months?: number;
}

// Combined stats model
export interface DashboardStatsModel {
  today: {
    total: number;
    byType: Array<{
      definitionId: string;
      name: string;
      count: number;
    }>;
  };
  streak: {
    current: number;
    longest: number;
  };
  goalRate: {
    overall: number;
    change: number;
  };
  weekCompare: {
    thisWeek: number;
    lastWeek: number;
    change: number;
  };
}

// Trend data response (includes raw records and date range)
export interface TrendDataModel {
  records: {
    recorded_at: string;
    definition_id: string;
  }[];
  types: {
    id: string;
    name: string;
    color: string;
  }[];
  start: string; // ISO date string
  end: string; // ISO date string
}

// Heatmap data response (includes raw records and date range)
export interface HeatmapDataModel {
  records: {
    recorded_at: string;
  }[];
  start: string; // ISO date string
  end: string; // ISO date string
}
