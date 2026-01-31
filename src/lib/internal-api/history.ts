/**
 * History API
 */

import { BaseApiService } from './base';
import type {
  HistoryListResponse as ServerHistoryListResponse,
  HistoryItem as ServerHistoryItem,
} from '@/types/history-server';
import { HistoryItemType } from '@/types/history-server';
import type {
  HistoryListResponse as ClientHistoryListResponse,
  HistoryItem as ClientHistoryItem,
  HistoryListRequest,
} from '@/types/history-client';
import type { BehaviorRecordWithDefinition as ServerBehaviorRecordWithDefinition } from '@/types/behavior-server';
import type { BehaviorRecordWithDefinition as ClientBehaviorRecordWithDefinition } from '@/types/behavior-client';
import type { Goal as ServerGoal } from '@/types/goal-server';
import type { Goal as ClientGoal } from '@/types/goal-client';
import type { Note as ServerNote } from '@/types/note-server';
import type { Note as ClientNote } from '@/types/note-client';
import { convertBehaviorRecordWithDefinition } from './behaviors';
import { convertGoal } from './goals';
import { convertNote } from './notes';

function convertHistoryItem(server: ServerHistoryItem): ClientHistoryItem {
  let convertedData: ClientBehaviorRecordWithDefinition | ClientGoal | ClientNote;

  switch (server.type) {
    case HistoryItemType.Behavior: {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const behaviorData = server.data as unknown as ServerBehaviorRecordWithDefinition;
      convertedData = convertBehaviorRecordWithDefinition(behaviorData);
      break;
    }
    case HistoryItemType.Goal: {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const goalData = server.data as ServerGoal;
      convertedData = convertGoal(goalData);
      break;
    }
    case HistoryItemType.Note: {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const noteData = server.data as ServerNote;
      convertedData = convertNote(noteData);
      break;
    }
    default:
      // This should never happen, but TypeScript needs this
      throw new Error(`Unknown history item type: ${server.type}`);
  }

  return {
    id: server.id,
    type: server.type,
    createdAt: server.createdAt,
    updatedAt: server.updatedAt,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    data: convertedData as unknown as ClientHistoryItem['data'],
  };
}

function convertHistoryListResponse(server: ServerHistoryListResponse): ClientHistoryListResponse {
  return {
    items: server.items.map(convertHistoryItem),
    total: server.total,
    page: server.page,
    pageSize: server.pageSize,
    hasMore: server.hasMore,
  };
}

export const historyApi = {
  /**
   * Get history list
   */
  async getHistory(params: HistoryListRequest = {}): Promise<ClientHistoryListResponse> {
    const searchParams = new URLSearchParams();
    if (params.type) searchParams.append('type', params.type);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.search) searchParams.append('search', params.search);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const response = await BaseApiService.fetchApi<ServerHistoryListResponse>(
      `/api/history?${searchParams.toString()}`,
    );

    return convertHistoryListResponse(response);
  },
};
