/**
 * History API
 */

import { BaseApiService } from './base';
import type { HistoryListResponse as ServerHistoryListResponse } from '@/types/history-server';
import type {
  HistoryListResponse as ClientHistoryListResponse,
  HistoryListRequest,
} from '@/types/history-client';

// History types are already compatible
function convertHistoryListResponse(server: ServerHistoryListResponse): ClientHistoryListResponse {
  return server;
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
