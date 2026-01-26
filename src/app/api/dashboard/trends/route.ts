import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';
import { dashboardService } from '@/lib/dashboard-service';
import type { GetTrendsParams } from '@/types/dashboard-server';

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 },
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') || '7d') as GetTrendsParams['range'];
    const start = searchParams.get('start') || undefined;
    const end = searchParams.get('end') || undefined;
    const typesParam = searchParams.get('types');
    const types = typesParam ? typesParam.split(',').filter(Boolean) : undefined;

    // Validate custom range
    if (range === 'custom') {
      if (!start || !end) {
        return NextResponse.json(
          { error: 'INVALID_DATE_RANGE', message: 'Start and end dates required for custom range' },
          { status: 400 },
        );
      }
      if (new Date(start) > new Date(end)) {
        return NextResponse.json(
          { error: 'INVALID_DATE_RANGE', message: 'Start date must be before end date' },
          { status: 400 },
        );
      }
    }

    const { data, error } = await dashboardService.getTrends(supabase, user.id, {
      range,
      start,
      end,
      types,
    });

    if (error) {
      return NextResponse.json({ error: 'INTERNAL_ERROR', message: error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'INTERNAL_ERROR', message }, { status: 500 });
  }
}
