import type { Database } from '@neo-log/be-edge';
import type { SupabaseClient } from '@supabase/supabase-js';

const PAGE = 1000;
const UPSERT_CHUNK = 500;
const CODES_CHUNK = 200;

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

export interface StockListEntry {
  code: string;
  name: string;
  market: 'SH' | 'SZ';
  secid: string;
}

export interface BarQueryOptions {
  /** Inclusive lower bound on trade_date. */
  startDate?: string;
  /** Inclusive upper bound on trade_date. */
  endDate?: string;
  /** Max number of rows returned. */
  limit?: number;
}

// ── interface ────────────────────────────────────────────────────────────────

export interface IEquityDb {
  getStockInfos(): Promise<StockRecord[]>;
  /** Fetch bars: [] = all codes, [...] = filter by codes (chunked). */
  getBars(codes: string[], options?: BarQueryOptions): Promise<DailyBarRecord[]>;
  upsertBars(bars: DailyBarRecord[]): Promise<void>;
  upsertStockList(stocks: StockListEntry[]): Promise<void>;
  markSynced(codes: string[]): Promise<void>;
  deleteStock(code: string): Promise<void>;
}

// ── EquityDb ─────────────────────────────────────────────────────────────────

export class EquityDb implements IEquityDb {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getStockInfos(): Promise<StockRecord[]> {
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

  async getBars(codes: string[], options?: BarQueryOptions): Promise<DailyBarRecord[]> {
    const { startDate, endDate, limit } = options ?? {};

    // [] = all codes (no filter), [...] = filter by chunk
    const query = async (codeChunk: string[]): Promise<DailyBarRecord[]> => {
      const result: DailyBarRecord[] = [];
      let offset = 0;
      while (true) {
        let q = this.supabase
          .from('neolog_equity_daily')
          .select('*')
          .order('code')
          .order('trade_date')
          .range(offset, offset + PAGE - 1);
        if (codeChunk.length > 0) q = q.in('code', codeChunk);
        if (startDate) q = q.gte('trade_date', startDate);
        if (endDate) q = q.lte('trade_date', endDate);
        if (limit !== undefined) q = q.limit(limit);
        const { data } = await q;
        const batch = data ?? [];
        result.push(...batch);
        if (batch.length < PAGE) break;
        offset += PAGE;
      }
      return result;
    };

    if (codes.length === 0) return query([]);

    const all: DailyBarRecord[] = [];
    for (let i = 0; i < codes.length; i += CODES_CHUNK) {
      all.push(...(await query(codes.slice(i, i + CODES_CHUNK))));
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
