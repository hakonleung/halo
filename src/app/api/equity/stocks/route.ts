import { createApiHandler } from '@neo-log/be-edge';
import { equityService } from '@neo-log/equity-be';

export const GET = createApiHandler(async (_req, _params, supabase) => {
  const data = await equityService.getStocks(supabase);
  return { data };
});
