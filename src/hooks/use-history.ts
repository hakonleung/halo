import { useQuery } from '@tanstack/react-query';
import type { HistoryListRequest, HistoryListResponse } from '@/types/history-client';

export function useHistory(params: HistoryListRequest = {}) {
  return useQuery<HistoryListResponse>({
    queryKey: ['history', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.type) searchParams.append('type', params.type);
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const res = await fetch(`/api/history?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      return res.json();
    },
  });
}
