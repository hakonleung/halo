import { spawn } from 'child_process';
import path from 'path';

import { getSupabaseClient } from '@neo-log/be-core';

import type { NextRequest } from 'next/server';

const SCRIPT = path.resolve(process.cwd(), 'scripts/equity_bridge.py');

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await getSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response('Not authenticated', { status: 401 });
  }

  // Get access token to pass to Python (for Supabase postgrest auth)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token ?? '';

  const body: { code?: string; offset?: number } = await req.json().catch(() => ({}));
  const args = body.code
    ? ['sync', body.code]
    : ['sync_all', ...(body.offset ? [String(body.offset)] : [])];

  console.log('[equity sync] spawning python:', SCRIPT, args);

  const stream = new ReadableStream({
    start(controller) {
      const py = spawn('python3', [SCRIPT, ...args], {
        env: { ...process.env, SUPABASE_ACCESS_TOKEN: accessToken },
      });

      py.stdout.on('data', (chunk: Buffer) => {
        controller.enqueue(chunk);
      });

      py.stderr.on('data', (d: Buffer) => {
        console.error('[equity sync] stderr:', d.toString());
      });

      py.on('close', (code) => {
        console.log('[equity sync] python exited:', code);
        controller.close();
      });

      py.on('error', (err) => {
        console.error('[equity sync] spawn error:', err);
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
