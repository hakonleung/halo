import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';
import { historyService } from '@/lib/history-service';
import type { HistoryListRequest, HistoryItemType } from '@/types/history-server';
import { SortOrder } from '@/types/history-server';

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { items: [], total: 0, error: 'Not authenticated' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');
    const sortOrderParam = searchParams.get('sortOrder');
    const params: HistoryListRequest = {
      type:
        typeParam &&
        (typeParam === 'all' ||
          typeParam === 'behavior' ||
          typeParam === 'goal' ||
          typeParam === 'note')
          ? (typeParam as HistoryItemType | 'all')
          : 'all',
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
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ items: [], total: 0, error: message }, { status: 500 });
  }
}
