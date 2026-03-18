import { createApiHandler } from '@neo-log/be-edge';

import type { EquityStockSummary } from '@neo-log/equity-fe';

const PAGE = 1000;

export const GET = createApiHandler(async (_req, _params, supabase) => {
  // Paginate via SQL-level LIMIT/OFFSET params to bypass PostgREST max-rows=1000.
  const all: EquityStockSummary[] = [];
  let offset = 0;
  while (true) {
    console.log('[equity/summary] fetching offset=', offset);
    let data = null;
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase as any).rpc('get_equity_summary', {
        p_limit: PAGE,
        p_offset: offset,
      });
      console.log(
        `[equity/summary] offset=${offset} attempt=${attempt} rows=${res.data?.length ?? 0} error=${JSON.stringify(res.error)}`,
      );
      if (!res.error) {
        data = res.data;
        lastError = null;
        break;
      }
      lastError = res.error;
      console.error(`[equity/summary] attempt ${attempt} failed:`, JSON.stringify(res.error));
    }
    if (lastError) {
      console.error('[equity/summary] all 3 attempts failed, offset=', offset);
      throw lastError;
    }
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const batch = (data ?? []) as EquityStockSummary[];
    all.push(...batch);
    if (batch.length < PAGE) break;
    offset += PAGE;
  }
  console.log('[equity/summary] total rows=', all.length);
  return { data: all };
});
