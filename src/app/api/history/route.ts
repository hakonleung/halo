import { createApiHandler } from '@/lib/api-helpers';
import { historyService } from '@/lib/history-service';
import type { HistoryListRequest } from '@/types/history-server';
import { HistoryItemType } from '@/types/history-server';
import { SortOrder } from '@/types/history-server';

export const GET = createApiHandler(async (request, _params, supabase, user) => {
  const { searchParams } = new URL(request.url);
  const typeParam =
    Object.values(HistoryItemType).find((t) => t === searchParams.get('type')) || 'all';
  const sortOrderParam = searchParams.get('sortOrder');
  const params: HistoryListRequest = {
    type: typeParam,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    search: searchParams.get('search') || undefined,
    page: parseInt(searchParams.get('page') || '1', 10),
    pageSize: parseInt(searchParams.get('pageSize') || '20', 10),
    sortOrder:
      sortOrderParam === 'asc' || sortOrderParam === 'desc'
        ? sortOrderParam === 'asc'
          ? SortOrder.Asc
          : SortOrder.Desc
        : SortOrder.Desc,
  };

  const res = await historyService.getHistory(supabase, user.id, params);
  // Convert history response to ApiResponse format
  return { data: res };
});
