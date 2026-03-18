import { getSupabaseClient } from '@neo-log/be-edge';
import { equityService } from '@neo-log/equity-be';

import type { NextRequest } from 'next/server';

export async function POST(_req: NextRequest) {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response('Not authenticated', { status: 401 });
  }
  return equityService.syncAllStream(supabase);
}
