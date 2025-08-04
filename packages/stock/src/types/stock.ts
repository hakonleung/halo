/**
 * 股票基本信息接口
 */
export interface StockInfo {
  code: string;
  name: string;
  symbol: string;
  market: string;
}

/**
 * K线数据接口
 */
export interface KlineData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amount: number;
  amplitude: number;
  pct_change: number;
  pct_change_amount: number;
  turnover: number;
}

/**
 * 实时数据接口
 */
export interface RealtimeData {
  code: string;
  name: string;
  current_price: number;
  change: number;
  change_amount: number;
  volume: number;
  amount: number;
  amplitude: number;
  high: number;
  low: number;
  open: number;
  prev_close: number;
  turnover: number;
  pe: number;
  pb: number;
  market_cap: number;
  circulating_market_cap: number;
}

/**
 * 个股基本信息接口
 */
export interface StockIndividualBasicInfo {
  code: string;
  name: string;
  industry: string;
  list_date: string;
  total_shares: string;
  circulating_shares: string;
} 