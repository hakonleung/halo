// Client-side types for dashboard

// Time range types
export type TimeRangePreset = 'today' | '7d' | '30d' | '90d';

export type TimeRange =
  | { type: 'preset'; value: TimeRangePreset }
  | { type: 'custom'; start: string; end: string };

// Today stats
export interface TodayStats {
  total: number;
  byType: Array<{
    definitionId: string;
    name: string;
    count: number;
  }>;
}

// Streak data
export interface Streak {
  current: number;
  longest: number;
}

// Goal rate
export interface GoalRate {
  overall: number;
  change: number;
}

// Week comparison
export interface WeekCompare {
  thisWeek: number;
  lastWeek: number;
  change: number;
}

// Combined dashboard stats
export interface DashboardStats {
  today: TodayStats;
  streak: Streak;
  goalRate: GoalRate;
  weekCompare: WeekCompare;
}

// Trend data point
export interface TrendPoint {
  date: string;
  total: number;
  byType: Record<string, number>;
}

// Behavior type info for charts
export interface BehaviorType {
  id: string;
  name: string;
  color: string;
}

// Trend data
export interface TrendData {
  points: TrendPoint[];
  types: BehaviorType[];
}

// Heatmap level (0-4)
export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

// Heatmap data point
export interface HeatmapData {
  date: string;
  count: number;
  level: HeatmapLevel;
}

// Goal progress for dashboard
export interface GoalProgress {
  id: string;
  name: string;
  progress: number;
  target: number;
  current: number;
  unit?: string;
  status: 'active' | 'completed' | 'abandoned';
}

// Stats card props
export interface StatsCardData {
  title: string;
  value: number | string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  icon?: string;
}

// Chart export format
export type ExportFormat = 'png' | 'csv';
