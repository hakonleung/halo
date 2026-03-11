import type { Database } from '@/server/types/database';
import type {
  AddStockRequest,
  EastmoneySearchItem,
  SyncResult,
} from '@/server/types/equity-server';
import type { SupabaseClient } from '@supabase/supabase-js';

// ── Eastmoney helpers ──────────────────────────────────────────────────────

const EM_HEADERS = { 'User-Agent': 'Mozilla/5.0', Referer: 'https://finance.eastmoney.com' };

/** Convert YYYY-MM-DD → YYYYMMDD for Eastmoney API */
function toEmDate(date: string): string {
  return date.replace(/-/g, '');
}

/** N days ago → YYYY-MM-DD */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

interface EmKlineResponse {
  data?: {
    code: string;
    name: string;
    klines?: string[];
  };
}

/** Fetch daily K-line (前复权) from Eastmoney */
async function fetchKlines(secid: string, beginDate: string, endDate: string): Promise<string[]> {
  const url =
    `https://push2his.eastmoney.com/api/qt/stock/kline/get` +
    `?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6` +
    `&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61` +
    `&klt=101&fqt=1&beg=${toEmDate(beginDate)}&end=${toEmDate(endDate)}`;

  const res = await fetch(url, { headers: EM_HEADERS });
  if (!res.ok) throw new Error(`Eastmoney kline fetch failed: ${res.status}`);
  const json: EmKlineResponse = await res.json();
  return json.data?.klines ?? [];
}

/** Parse one kline string → row object */
function parseKline(line: string, code: string) {
  // format: date,open,close,high,low,volume,amount,amplitude%,change%,changeAmt,turnover%
  const parts = line.split(',');
  return {
    code,
    trade_date: parts[0],
    open: parseFloat(parts[1]),
    close: parseFloat(parts[2]),
    high: parseFloat(parts[3]),
    low: parseFloat(parts[4]),
    volume: parseInt(parts[5], 10),
    amount: parseFloat(parts[6]) || null,
    amplitude: parseFloat(parts[7]) || null,
    change_pct: parseFloat(parts[8]) || null,
    change_amount: parseFloat(parts[9]) || null,
    turnover_rate: parseFloat(parts[10]) || null,
  };
}

// ── Service ────────────────────────────────────────────────────────────────

export const equityService = {
  async getStocks(supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
      .from('neolog_equity_list')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },

  async addStock(supabase: SupabaseClient<Database>, req: AddStockRequest) {
    const { data, error } = await supabase
      .from('neolog_equity_list')
      .insert({
        code: req.code,
        name: req.name,
        market: req.market,
        secid: req.secid,
        industry: req.industry ?? null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteStock(supabase: SupabaseClient<Database>, code: string) {
    // Delete daily data first
    await supabase.from('neolog_equity_daily').delete().eq('code', code);
    const { error } = await supabase.from('neolog_equity_list').delete().eq('code', code);
    if (error) throw new Error(error.message);
  },

  async getDailyBars(supabase: SupabaseClient<Database>, code: string, limit = 365) {
    const { data, error } = await supabase
      .from('neolog_equity_daily')
      .select('*')
      .eq('code', code)
      .order('trade_date', { ascending: true })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data;
  },

  /** Sync one stock: fetch missing dates and upsert */
  async syncStock(
    supabase: SupabaseClient<Database>,
    stock: {
      code: string;
      secid: string;
      name: string;
    },
  ): Promise<SyncResult> {
    // Get latest date in DB
    const { data: latest } = await supabase
      .from('neolog_equity_daily')
      .select('trade_date')
      .eq('code', stock.code)
      .order('trade_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const today = new Date().toISOString().slice(0, 10);
    const beginDate = latest?.trade_date
      ? (() => {
          const d = new Date(latest.trade_date);
          d.setDate(d.getDate() + 1);
          return d.toISOString().slice(0, 10);
        })()
      : daysAgo(365);

    if (beginDate > today) {
      return { code: stock.code, inserted: 0, latestDate: latest?.trade_date ?? null };
    }

    const klines = await fetchKlines(stock.secid, beginDate, today);
    if (klines.length === 0) {
      return { code: stock.code, inserted: 0, latestDate: latest?.trade_date ?? null };
    }

    const rows = klines.map((line) => parseKline(line, stock.code));

    const { error } = await supabase
      .from('neolog_equity_daily')
      .upsert(rows, { onConflict: 'code,trade_date', ignoreDuplicates: true });
    if (error) throw new Error(error.message);

    // Update last_synced_at
    await supabase
      .from('neolog_equity_list')
      .update({ last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('code', stock.code);

    const latestDate = rows.at(-1)?.trade_date ?? null;
    return { code: stock.code, inserted: rows.length, latestDate };
  },

  /** Sync all tracked stocks */
  async syncAll(supabase: SupabaseClient<Database>): Promise<SyncResult[]> {
    const { data: stocks, error } = await supabase
      .from('neolog_equity_list')
      .select('code,secid,name');
    if (error) throw new Error(error.message);

    const results: SyncResult[] = [];
    for (const stock of stocks) {
      const result = await equityService.syncStock(supabase, stock);
      results.push(result);
    }
    return results;
  },

  /** Search stocks via Eastmoney suggest API */
  async searchStocks(query: string): Promise<EastmoneySearchItem[]> {
    if (!query.trim()) return [];
    const url =
      `https://searchapi.eastmoney.com/api/suggest/get` +
      `?input=${encodeURIComponent(query)}&type=14&token=D43BF722C8E33BDC906FB84D85E326278B09BBB2&markettype=&mktNum=`;

    const res = await fetch(url, { headers: EM_HEADERS });
    if (!res.ok) return [];

    const json: {
      QuotationCodeTable?: {
        Data?: Array<{
          Code: string;
          Name: string;
          MktNum: string;
          Classify?: string;
        }>;
      };
    } = await res.json();

    const items = json.QuotationCodeTable?.Data ?? [];
    return items
      .filter((d) => d.Classify === 'ASHARE_SZ' || d.Classify === 'ASHARE_SH')
      .map((d) => {
        const market: 'SH' | 'SZ' = d.Classify === 'ASHARE_SH' ? 'SH' : 'SZ';
        const mktPrefix = market === 'SH' ? '1' : '0';
        return {
          code: d.Code,
          name: d.Name,
          market,
          secid: `${mktPrefix}.${d.Code}`,
        };
      });
  },
};
