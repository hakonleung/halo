import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';
import { dashboardService } from '@/lib/dashboard-service';

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
    const monthsParam = searchParams.get('months');
    const months = monthsParam ? parseInt(monthsParam, 10) : 12;

    if (isNaN(months) || months < 1 || months > 24) {
      return NextResponse.json(
        { error: 'INVALID_PARAMS', message: 'Months must be between 1 and 24' },
        { status: 400 },
      );
    }

    const { data, error } = await dashboardService.getHeatmap(supabase, user.id, { months });

    if (error) {
      return NextResponse.json({ error: 'INTERNAL_ERROR', message: error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'INTERNAL_ERROR', message }, { status: 500 });
  }
}
