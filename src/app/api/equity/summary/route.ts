import { createApiHandler } from '@/server/services/api-helpers';

import type { EquityStockSummary } from '@/client/types/equity-client';

export const GET = createApiHandler(async (_req, _params, supabase) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
  const { data, error } = await (supabase as any).rpc('get_equity_summary');
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return { data: (data ?? []) as EquityStockSummary[] };
});
