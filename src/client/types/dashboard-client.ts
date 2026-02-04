// Client-side types for dashboard
import type { GoalStatus } from './goal-client';

// Time range types
export enum TimeRangePreset {
  Today = 'today',
  Last7Days = '7d',
  Last30Days = '30d',
  Last90Days = '90d',
}

export type TimeRange =
  | { type: 'preset'; value: TimeRangePreset }
  | { type: 'custom'; start: string; end: string };

// Combined dashboard stats
export interface DashboardStats {
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

// Trend data point
export interface TrendPoint {
  date: string;
  total: number;
  byType: Record<string, number>;
}

// Trend data
export interface TrendData {
  points: TrendPoint[];
  types: {
    id: string;
    name: string;
    color: string;
  }[];
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
  status: GoalStatus;
}
