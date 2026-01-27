import { useQuery } from '@tanstack/react-query';
import type { HistoryListRequest, HistoryListResponse } from '@/types/history-client';
import { internalApiService } from '@/lib/internal-api';

export function useHistory(params: HistoryListRequest = {}) {
  return useQuery<HistoryListResponse>({
    queryKey: ['history', params],
    queryFn: () => internalApiService.getHistory(params),
  });
}
