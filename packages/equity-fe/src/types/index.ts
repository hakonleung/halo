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

export enum StrategyType {
  FindSimilar = 'find_similar',
  FindBreakout = 'find_breakout',
  FindVolumePriceDivergence = 'find_volume_price_divergence',
  FindMultiTimeframe = 'find_multi_timeframe',
  FindMomentumReversal = 'find_momentum_reversal',
  FindChartPattern = 'find_chart_pattern',
}

export interface StrategyMeta {
  label: string;
  needsRange: boolean; // true = requires K-line date range selection
  description: string;
}

export const STRATEGY_META: Record<StrategyType, StrategyMeta> = {
  [StrategyType.FindSimilar]: {
    label: '形态相似',
    needsRange: true,
    description: '找历史相似走势',
  },
  [StrategyType.FindBreakout]: {
    label: '布林突破',
    needsRange: false,
    description: '布林带压缩后突破',
  },
  [StrategyType.FindVolumePriceDivergence]: {
    label: '量价背离',
    needsRange: false,
    description: 'OBV 与价格背离',
  },
  [StrategyType.FindMultiTimeframe]: {
    label: '多周期共振',
    needsRange: false,
    description: '日/周/月指标同向',
  },
  [StrategyType.FindMomentumReversal]: {
    label: '动量反转',
    needsRange: false,
    description: '趋势疲软反转信号',
  },
  [StrategyType.FindChartPattern]: {
    label: '图形形态',
    needsRange: false,
    description: '头肩/双顶/三角形',
  },
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

// Generic match for scan-type strategies
export interface ScanMatch {
  code: string;
  name: string;
  latestDate?: string;
  confidence?: string | number;
  direction?: string;
  breakoutDirection?: string;
  divergenceType?: string;
  divergenceStrength?: number;
  resonanceScore?: number;
  trendScore?: number;
  signalCount?: number;
  pattern?: string;
  squeezeDays?: number;
  signals?: string[];
}

export interface FindSimilarRequest {
  strategy: StrategyType;
  code: string;
  startDate?: string; // required for find_similar
  endDate?: string; // required for find_similar
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
