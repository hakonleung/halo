import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';
import { behaviorService } from '@/lib/behavior-service';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Not authenticated' }, { status: 401 });
    }

    const updates = await request.json();
    const res = await behaviorService.updateDefinition(supabase, user.id, id, updates);
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
