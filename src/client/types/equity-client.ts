export interface EquityStock {
  id: string;
  code: string;
  name: string;
  market: 'SH' | 'SZ';
  secid: string;
  industry: string | null;
  last_synced_at: string | null;
  created_at: string | null;
}

export interface EquityDailyBar {
  code: string;
  trade_date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number; // lots (手)
  amount: number | null;
  amplitude: number | null; // % 振幅
  change_pct: number | null; // % 涨跌幅
  change_amount: number | null;
  turnover_rate: number | null; // % 换手率
}

export interface EquityDailyBarWithMA extends EquityDailyBar {
  ma5: number | null;
  ma10: number | null;
  ma20: number | null;
}

export interface EquitySearchResult {
  code: string;
  name: string;
  secid: string;
  market: 'SH' | 'SZ';
  industry?: string;
}

export interface EquitySyncResult {
  synced: number;
  results: Array<{ code: string; inserted: number; latestDate: string | null }>;
}

export type EquityRange = '1M' | '3M' | '6M' | '1Y';
