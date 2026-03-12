import { spawn } from 'child_process';
import path from 'path';

import { getSupabaseClient } from '@/server/services/supabase-server';

import type { NextRequest } from 'next/server';

const SCRIPT = path.resolve(process.cwd(), 'scripts/equity_bridge.py');

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response('Not authenticated', { status: 401 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token ?? '';

  const body: { code?: string; startDate?: string; endDate?: string } = await req
    .json()
    .catch(() => ({}));
  if (!body.code || !body.startDate || !body.endDate) {
    return new Response('code, startDate, endDate are required', { status: 400 });
  }

  const args = ['find_similar', body.code, body.startDate, body.endDate];

  const stream = new ReadableStream({
    start(controller) {
      const py = spawn('python3', [SCRIPT, ...args], {
        env: { ...process.env, SUPABASE_ACCESS_TOKEN: accessToken },
      });

      py.stdout.on('data', (chunk: Buffer) => {
        controller.enqueue(chunk);
      });

      py.stderr.on('data', (d: Buffer) => {
        console.error('[equity/similar] stderr:', d.toString());
      });

      py.on('close', (code) => {
        console.log('[equity/similar] python exited:', code);
        controller.close();
      });

      py.on('error', (err) => {
        console.error('[equity/similar] spawn error:', err);
        controller.error(err);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}
