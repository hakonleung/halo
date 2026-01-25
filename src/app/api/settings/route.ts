import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';
import { settingsService } from '@/lib/settings-service';

export async function GET() {
  try {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ settings: null, error: 'Not authenticated' }, { status: 401 });
    }

    const res = await settingsService.getSettings(supabase, user.id);
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ settings: null, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ settings: null, error: 'Not authenticated' }, { status: 401 });
    }

    const updates = await request.json();
    const res = await settingsService.updateSettings(supabase, user.id, updates);
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ settings: null, error: message }, { status: 500 });
  }
}
