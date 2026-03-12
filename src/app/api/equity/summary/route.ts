import { createApiHandler } from '@/server/services/api-helpers';

import type { EquityStockSummary } from '@/client/types/equity-client';

const PAGE_SIZE = 1000;

export const GET = createApiHandler(async (_req, _params, supabase) => {
  const all: EquityStockSummary[] = [];
  let offset = 0;
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
    const { data, error } = await (supabase as any)
      .rpc('get_equity_summary')
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const batch = (data ?? []) as EquityStockSummary[];
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return { data: all };
});
