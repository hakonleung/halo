import { createApiHandler } from '@/server/services/api-helpers';
import { equityService } from '@/server/services/equity-service';

export const POST = createApiHandler(async (req, _params, supabase) => {
  const body: { code?: string } = await req.json().catch(() => ({}));

  if (body.code) {
    const { data: stocks } = await supabase
      .from('neolog_equity_list')
      .select('code,secid,name')
      .eq('code', body.code)
      .maybeSingle();
    if (!stocks) throw new Error(`Stock ${body.code} not found`);
    const result = await equityService.syncStock(supabase, stocks);
    return { data: { synced: 1, results: [result] } };
  }

  const results = await equityService.syncAll(supabase);
  return { data: { synced: results.length, results } };
});
