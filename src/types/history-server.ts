import { BehaviorRecordWithDefinition } from './behavior-server';
import { Goal } from './goal-server';
import { Note } from './note-server';

export type HistoryItemType = 'behavior' | 'goal' | 'note';

export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  createdAt: string;
  updatedAt: string;
  data: BehaviorRecordWithDefinition | Goal | Note;
}

export interface HistoryListRequest {
  type?: HistoryItemType | 'all';
  startDate?: string;
  endDate?: string;
  behaviorCategory?: string;
  goalStatus?: 'active' | 'completed' | 'abandoned';
  noteTags?: string[];
  search?: string;
  sortBy?: 'time' | 'type';
  sortOrder?: 'asc' | 'desc';
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

