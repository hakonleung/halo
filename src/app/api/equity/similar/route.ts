import { getSupabaseClient } from '@neo-log/be-edge';
import { equityService } from '@neo-log/equity-be';

import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response('Not authenticated', { status: 401 });
  }

  const body: { code?: string; startDate?: string; endDate?: string } = await req
    .json()
    .catch(() => ({}));
  if (!body.code || !body.startDate || !body.endDate) {
    return new Response('code, startDate, endDate are required', { status: 400 });
  }

  return equityService.findSimilarStream(supabase, body.code, body.startDate, body.endDate);
}
