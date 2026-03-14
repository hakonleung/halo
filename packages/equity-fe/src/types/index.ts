export interface EquityStock {
  id: string;
  code: string;
  name: string;
  market: 'SH' | 'SZ' | 'BJ';
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
  market: 'SH' | 'SZ' | 'BJ';
  industry?: string;
}

export interface EquitySyncResult {
  synced: number;
  results: Array<{ code: string; inserted: number; latestDate: string | null }>;
}

export type EquityRange = '1M' | '3M' | '6M' | '1Y';

export interface EquityStockSummary {
  code: string;
  name: string;
  market: 'SH' | 'SZ' | 'BJ';
  close: number | null;
  change_pct_1d: number | null;
  change_pct_5d: number | null;
  change_pct_10d: number | null;
  change_pct_20d: number | null;
  change_pct_50d: number | null;
  change_pct_120d: number | null;
  turnover_rate: number | null;
  sparkline: number[];
}

export type SortKey =
  | 'change_1d'
  | 'change_5d'
  | 'change_10d'
  | 'change_20d'
  | 'change_50d'
  | 'change_120d'
  | 'turnover';

export type PctPeriod = Exclude<SortKey, 'turnover'>;

export type SortDir = 'asc' | 'desc';

export type MarketFilter = 'ALL' | 'SH' | 'SZ' | 'BJ';

export interface EquityFilter {
  pctPeriod: PctPeriod;
  pctMin: string;
  pctMax: string;
  turnoverMin: string;
  turnoverMax: string;
  market: MarketFilter;
  excludeST: boolean;
}

export const DEFAULT_EQUITY_FILTER: EquityFilter = {
  pctPeriod: 'change_1d',
  pctMin: '',
  pctMax: '',
  turnoverMin: '',
  turnoverMax: '',
  market: 'ALL',
  excludeST: false,
};

export interface PatternMatch {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  similarity: number;
  totalReturn: number;
  queryTotalReturn: number;
}

export interface FindSimilarRequest {
  code: string;
  startDate: string;
  endDate: string;
}

export type SyncEvent =
  | { type: 'status'; message: string }
  | { type: 'init_progress'; batch: number; total_batches: number }
  | { type: 'init_done'; total: number }
  | {
      type: 'progress';
      code: string;
      name: string;
      inserted: number;
      latestDate: string | null;
      error: string | null;
      index: number;
      total: number;
    }
  | { type: 'error'; code: string; message: string; resume_from: number }
  | { type: 'done'; synced: number };
