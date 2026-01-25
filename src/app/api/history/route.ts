import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';
import { historyService } from '@/lib/history-service';
import { HistoryListRequest } from '@/types/history-server';

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ items: [], total: 0, error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params: HistoryListRequest = {
      type: (searchParams.get('type') as any) || 'all',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '20', 10),
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };

    const res = await historyService.getHistory(supabase, user.id, params);
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ items: [], total: 0, error: message }, { status: 500 });
  }
}

