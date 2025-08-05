/**
 * 股票基本信息类型
 */
export interface Stock {
  id: number;
  symbol: string;
  name: string;
  industry?: string;
  listDate?: string;
  totalShares?: string;
  circulatingShares?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 股票价格数据类型
 */
export interface StockPrice {
  id: number;
  symbol: string;
  tradeDate: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
  amount?: string;
  changePercent?: string;
  turnover?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * API响应基础结构
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

/**
 * 股票列表API响应
 */
export interface StocksResponse {
  stocks: Stock[];
  total: number;
}

/**
 * 股票价格API响应
 */
export interface StockPricesResponse {
  prices: StockPrice[];
  total: number;
  symbols: string[];
  dateRange: {
    startDate?: string;
    endDate?: string;
  };
}

/**
 * 股票价格查询参数
 */
export interface StockPricesParams {
  symbols: string | string[];
  startDate?: string;
  endDate?: string;
  limit?: number;
}
