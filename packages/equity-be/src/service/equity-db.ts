import type { Database } from '@neo-log/be-edge';
import type { SupabaseClient } from '@supabase/supabase-js';

// ── shared types ────────────────────────────────────────────────────────────

export interface DailyBarRecord {
  code: string;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amount: number | null;
  amplitude: number | null;
  change_pct: number | null;
  change_amount: number | null;
  turnover_rate: number | null;
}

export interface StockRecord {
  code: string;
  name: string;
  secid: string;
  last_synced_at: string | null;
}

// ── reads ───────────────────────────────────────────────────────────────────

export async function dbFetchAllStocks(
  supabase: SupabaseClient<Database>,
): Promise<StockRecord[]> {
  const all: StockRecord[] = [];
  const PAGE = 1000;
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from('neolog_equity_list')
      .select('code,name,secid,last_synced_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE - 1);
    const batch = data ?? [];
    all.push(...batch);
    if (batch.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

export async function dbGetUpToDateCodes(
  supabase: SupabaseClient<Database>,
  tradeDate: string,
): Promise<Set<string>> {
  const codes = new Set<string>();
  const PAGE = 1000;
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from('neolog_equity_daily')
      .select('code')
      .eq('trade_date', tradeDate)
      .range(offset, offset + PAGE - 1);
    const batch = data ?? [];
    for (const r of batch) codes.add(r.code);
    if (batch.length < PAGE) break;
    offset += PAGE;
  }
  return codes;
}

export async function dbGetDailyBars(
  supabase: SupabaseClient<Database>,
  code: string,
  limit = 365,
) {
  const { data, error } = await supabase
    .from('neolog_equity_daily')
    .select('*')
    .eq('code', code)
    .order('trade_date', { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data;
}

export async function dbGetQueryBars(
  supabase: SupabaseClient<Database>,
  code: string,
  startDate: string,
  endDate: string,
): Promise<Array<{ trade_date: string; close: number }>> {
  const { data } = await supabase
    .from('neolog_equity_daily')
    .select('trade_date,close')
    .eq('code', code)
    .gte('trade_date', startDate)
    .lte('trade_date', endDate)
    .order('trade_date');
  return data ?? [];
}

export async function dbGetNameMap(
  supabase: SupabaseClient<Database>,
): Promise<Record<string, string>> {
  const { data } = await supabase.from('neolog_equity_list').select('code,name');
  const map: Record<string, string> = {};
  for (const r of data ?? []) map[r.code] = r.name;
  return map;
}

/** Load all recent close prices (excluding `excludeCode`) for pattern matching. */
export async function dbGetRecentBars(
  supabase: SupabaseClient<Database>,
  sinceDate: string,
  excludeCode: string,
): Promise<Array<{ code: string; trade_date: string; close: number }>> {
  const all: Array<{ code: string; trade_date: string; close: number }> = [];
  const PAGE = 9999;
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from('neolog_equity_daily')
      .select('code,trade_date,close')
      .neq('code', excludeCode)
      .gte('trade_date', sinceDate)
      .order('code')
      .order('trade_date')
      .range(offset, offset + PAGE - 1);
    const batch = data ?? [];
    all.push(...batch);
    if (batch.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

// ── writes ──────────────────────────────────────────────────────────────────

const UPSERT_CHUNK = 500;

export async function dbUpsertBars(
  supabase: SupabaseClient<Database>,
  bars: DailyBarRecord[],
): Promise<void> {
  for (let i = 0; i < bars.length; i += UPSERT_CHUNK) {
    await supabase
      .from('neolog_equity_daily')
      .upsert(bars.slice(i, i + UPSERT_CHUNK), { onConflict: 'code,trade_date' });
  }
}

export async function dbUpsertStockList(
  supabase: SupabaseClient<Database>,
  stocks: Array<{ code: string; name: string; market: 'SH' | 'SZ'; secid: string }>,
): Promise<void> {
  const now = new Date().toISOString();
  for (let i = 0; i < stocks.length; i += UPSERT_CHUNK) {
    await supabase
      .from('neolog_equity_list')
      .upsert(
        stocks.slice(i, i + UPSERT_CHUNK).map((s) => ({ ...s, updated_at: now })),
        { onConflict: 'code' },
      );
  }
}

export async function dbMarkSynced(
  supabase: SupabaseClient<Database>,
  codes: string[],
): Promise<void> {
  if (codes.length === 0) return;
  const now = new Date().toISOString();
  await supabase
    .from('neolog_equity_list')
    .update({ last_synced_at: now, updated_at: now })
    .in('code', codes);
}

export async function dbDeleteStock(
  supabase: SupabaseClient<Database>,
  code: string,
): Promise<void> {
  await supabase.from('neolog_equity_daily').delete().eq('code', code);
  const { error } = await supabase.from('neolog_equity_list').delete().eq('code', code);
  if (error) throw new Error(error.message);
}
