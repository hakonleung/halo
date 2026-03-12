import { createApiHandler } from '@/server/services/api-helpers';
import { equityService } from '@/server/services/equity-service';

import type { AddStockRequest } from '@/server/types/equity-server';

export const GET = createApiHandler(async (_req, _params, supabase) => {
  const data = await equityService.getStocks(supabase);
  return { data };
});

export const POST = createApiHandler(async (req, _params, supabase) => {
  const body: AddStockRequest = await req.json();
  if (!body.code || !body.name || !body.market || !body.secid) {
    throw new Error('code, name, market, secid are required');
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token ?? '';
  const stock = await equityService.addStock(supabase, body);
  // Kick off initial sync in the background
  void equityService.syncStock(
    supabase,
    { code: stock.code, secid: stock.secid, name: stock.name },
    accessToken,
  );
  return { data: stock, status: 201 };
});
