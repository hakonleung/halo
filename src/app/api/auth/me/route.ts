import { NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service';
import { getSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await getSupabaseClient();
    const res = await authService.getCurrentUser(supabase);
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ user: null, session: null, error: message }, { status: 500 });
  }
}
