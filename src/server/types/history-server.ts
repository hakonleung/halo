import type { BehaviorRecordWithDefinition } from './behavior-server';
import type { Goal } from './goal-server';
import type { Note } from './note-server';

export enum HistoryItemType {
  Behavior = 'behavior',
  Goal = 'goal',
  Note = 'note',
}

export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  createdAt: string;
  updatedAt: string;
  data: BehaviorRecordWithDefinition | Goal | Note;
}

enum GoalStatus {
  Active = 'active',
  Completed = 'completed',
  Abandoned = 'abandoned',
}

enum HistorySortBy {
  Time = 'time',
  Type = 'type',
}

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export interface HistoryListRequest {
  type?: HistoryItemType | 'all';
  startDate?: string;
  endDate?: string;
  behaviorCategory?: string;
  goalStatus?: GoalStatus;
  noteTags?: string[];
  search?: string;
  sortBy?: HistorySortBy;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface HistoryListResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
