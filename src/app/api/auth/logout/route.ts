import { NextResponse } from 'next/server';

import { authService } from '@/server/services/auth-service';
import { getSupabaseClient } from '@neo-log/be-core';

export async function POST() {
  try {
    const supabase = await getSupabaseClient();
    const res = await authService.signOut(supabase);
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
