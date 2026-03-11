import { createApiHandler } from '@/server/services/api-helpers';
import { equityService } from '@/server/services/equity-service';

export const GET = createApiHandler(async (req, _params, _supabase) => {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const data = await equityService.searchStocks(q);
  return { data };
});
