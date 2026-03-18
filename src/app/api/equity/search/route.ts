import { createApiHandler } from '@neo-log/be-edge';

export const GET = createApiHandler(async (req, _params, supabase) => {
  const { searchParams } = new URL(req.url);
  // Strip characters that carry meaning in PostgREST filter syntax to prevent
  // filter-string injection via the .or() interpolation below.
  const q = (searchParams.get('q') ?? '').trim().replace(/[(),\s"']/g, '');
  if (!q) return { data: [] };

  const { data, error } = await supabase
    .from('neolog_equity_list')
    .select('code,name,market,secid')
    .or(`code.ilike.%${q}%,name.ilike.%${q}%`)
    .limit(20);

  if (error) throw new Error(error.message);
  return { data: data ?? [] };
});
