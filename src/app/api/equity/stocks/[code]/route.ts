import { createApiHandler } from '@neo-log/be-edge';
import { equityService } from '@neo-log/equity-be';

export const DELETE = createApiHandler(async (_req, params, supabase) => {
  if (!params) throw new Error('Missing params');
  const { code } = await params;
  await equityService.deleteStock(supabase, code);
  return { data: { success: true } };
});

export const GET = createApiHandler(async (req, params, supabase) => {
  if (!params) throw new Error('Missing params');
  const { code } = await params;
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') ?? '365', 10);
  const data = await equityService.getDailyBars(supabase, code, limit);
  return { data };
});
