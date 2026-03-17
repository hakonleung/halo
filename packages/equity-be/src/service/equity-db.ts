import type { Database } from '@neo-log/be-edge';
import type { SupabaseClient } from '@supabase/supabase-js';

const PAGE = 1000;
const UPSERT_CHUNK = 500;

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

export interface RecentBar {
  code: string;
  trade_date: string;
  close: number;
}

export interface OHLCVBar {
  code: string;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockListEntry {
  code: string;
  name: string;
  market: 'SH' | 'SZ';
  secid: string;
}

// ── interface ────────────────────────────────────────────────────────────────

export interface IEquityDb {
  fetchAllStocks(): Promise<StockRecord[]>;
  getUpToDateCodes(tradeDate: string): Promise<Set<string>>;
  getDailyBars(code: string, limit?: number): Promise<DailyBarRecord[]>;
  getQueryBars(code: string, startDate: string, endDate: string): Promise<Array<{ trade_date: string; close: number }>>;
  getNameMap(): Promise<Record<string, string>>;
  getRecentBars(sinceDate: string): Promise<RecentBar[]>;
  getRecentBarsOHLCV(sinceDate: string): Promise<OHLCVBar[]>;
  upsertBars(bars: DailyBarRecord[]): Promise<void>;
  upsertStockList(stocks: StockListEntry[]): Promise<void>;
  markSynced(codes: string[]): Promise<void>;
  deleteStock(code: string): Promise<void>;
}

// ── EquityDb ─────────────────────────────────────────────────────────────────

export class EquityDb implements IEquityDb {
  constructor(private supabase: SupabaseClient<Database>) {}

  async fetchAllStocks(): Promise<StockRecord[]> {
    const all: StockRecord[] = [];
    let offset = 0;
    while (true) {
      const { data } = await this.supabase
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

  async getUpToDateCodes(tradeDate: string): Promise<Set<string>> {
    const codes = new Set<string>();
    let offset = 0;
    while (true) {
      const { data } = await this.supabase
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

  async getDailyBars(code: string, limit = 365): Promise<DailyBarRecord[]> {
    const { data, error } = await this.supabase
      .from('neolog_equity_daily')
      .select('*')
      .eq('code', code)
      .order('trade_date', { ascending: true })
      .limit(limit);
    if (error) throw new Error(error.message);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (data ?? []) as DailyBarRecord[];
  }

  async getQueryBars(
    code: string,
    startDate: string,
    endDate: string,
  ): Promise<Array<{ trade_date: string; close: number }>> {
    const { data } = await this.supabase
      .from('neolog_equity_daily')
      .select('trade_date,close')
      .eq('code', code)
      .gte('trade_date', startDate)
      .lte('trade_date', endDate)
      .order('trade_date');
    return data ?? [];
  }

  async getNameMap(): Promise<Record<string, string>> {
    const { data } = await this.supabase.from('neolog_equity_list').select('code,name');
    const map: Record<string, string> = {};
    for (const r of data ?? []) map[r.code] = r.name;
    return map;
  }

  async getRecentBars(sinceDate: string): Promise<RecentBar[]> {
    const all: RecentBar[] = [];
    let offset = 0;
    while (true) {
      const { data } = await this.supabase
        .from('neolog_equity_daily')
        .select('code,trade_date,close')
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

  async getRecentBarsOHLCV(sinceDate: string): Promise<OHLCVBar[]> {
    const all: OHLCVBar[] = [];
    let offset = 0;
    while (true) {
      const { data } = await this.supabase
        .from('neolog_equity_daily')
        .select('code,trade_date,open,high,low,close,volume')
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

  async upsertBars(bars: DailyBarRecord[]): Promise<void> {
    for (let i = 0; i < bars.length; i += UPSERT_CHUNK) {
      await this.supabase
        .from('neolog_equity_daily')
        .upsert(bars.slice(i, i + UPSERT_CHUNK), { onConflict: 'code,trade_date' });
    }
  }

  async upsertStockList(stocks: StockListEntry[]): Promise<void> {
    const now = new Date().toISOString();
    for (let i = 0; i < stocks.length; i += UPSERT_CHUNK) {
      await this.supabase.from('neolog_equity_list').upsert(
        stocks.slice(i, i + UPSERT_CHUNK).map((s) => ({ ...s, updated_at: now })),
        { onConflict: 'code' },
      );
    }
  }

  async markSynced(codes: string[]): Promise<void> {
    if (codes.length === 0) return;
    const now = new Date().toISOString();
    await this.supabase
      .from('neolog_equity_list')
      .update({ last_synced_at: now, updated_at: now })
      .in('code', codes);
  }

  async deleteStock(code: string): Promise<void> {
    await this.supabase.from('neolog_equity_daily').delete().eq('code', code);
    const { error } = await this.supabase.from('neolog_equity_list').delete().eq('code', code);
    if (error) throw new Error(error.message);
  }
}
