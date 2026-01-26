import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';
import { dashboardService } from '@/lib/dashboard-service';

export async function GET() {
  try {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data, error } = await dashboardService.getStats(supabase, user.id);

    if (error) {
      return NextResponse.json(
        { error: 'INTERNAL_ERROR', message: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message },
      { status: 500 }
    );
  }
}
