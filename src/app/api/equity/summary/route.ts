import { createApiHandler } from '@/server/services/api-helpers';

import type { EquityStockSummary } from '@/client/types/equity-client';

export const GET = createApiHandler(async (_req, _params, supabase) => {
  // Use a large range to bypass PostgREST's default 1000-row limit.
  // A股 has ~5500 stocks; 9999 covers all in one request.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
  const { data, error } = await (supabase as any)
    .rpc('get_equity_summary')
    .range(0, 9999);
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return { data: (data ?? []) as EquityStockSummary[] };
});
