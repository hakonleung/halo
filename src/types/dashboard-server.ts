// Server-side types for dashboard statistics

// Request parameters
export interface GetTrendsParams {
  range: 'today' | '7d' | '30d' | '90d' | 'custom';
  start?: string;
  end?: string;
  types?: string[];
}

export interface GetHeatmapParams {
  months?: number;
}

// Today stats
export interface TodayStatsModel {
  total: number;
  byType: Array<{
    definitionId: string;
    name: string;
    count: number;
  }>;
}

// Streak data
export interface StreakModel {
  current: number;
  longest: number;
}

// Goal rate
export interface GoalRateModel {
  overall: number;
  change: number;
}

// Week comparison
export interface WeekCompareModel {
  thisWeek: number;
  lastWeek: number;
  change: number;
}

// Combined stats model
export interface DashboardStatsModel {
  today: TodayStatsModel;
  streak: StreakModel;
  goalRate: GoalRateModel;
  weekCompare: WeekCompareModel;
}

// Trend data point
export interface TrendPointModel {
  date: string;
  total: number;
  byType: Record<string, number>;
}

// Behavior type info
export interface BehaviorTypeModel {
  id: string;
  name: string;
  color: string;
}

// Trend data response
export interface TrendDataModel {
  points: TrendPointModel[];
  types: BehaviorTypeModel[];
}

// Heatmap data point
export interface HeatmapDataModel {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

// API Response wrappers
export interface DashboardStatsResponse {
  data: DashboardStatsModel;
}

export interface TrendDataResponse {
  data: TrendDataModel;
}

export interface HeatmapDataResponse {
  data: HeatmapDataModel[];
}

export interface DashboardErrorResponse {
  error: string;
  message: string;
}
