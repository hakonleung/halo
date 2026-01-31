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

// Raw record for trends (returned from service, processed by frontend)
export interface TrendRecordModel {
  recorded_at: string;
  definition_id: string;
}

// Behavior type info
export interface BehaviorTypeModel {
  id: string;
  name: string;
  color: string;
}

// Trend data response (includes raw records and date range)
export interface TrendDataModel {
  records: TrendRecordModel[];
  types: BehaviorTypeModel[];
  start: string; // ISO date string
  end: string; // ISO date string
}

// Raw record for heatmap (returned from service, processed by frontend)
export interface HeatmapRecordModel {
  recorded_at: string;
}

// Heatmap data response (includes raw records and date range)
export interface HeatmapDataModel {
  records: HeatmapRecordModel[];
  start: string; // ISO date string
  end: string; // ISO date string
}
