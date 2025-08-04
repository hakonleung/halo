/**
 * API响应接口
 * @template T 响应数据的类型
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
  symbol?: string;
  start_date?: string;
  end_date?: string;
  timestamp: string;
}

/**
 * 函数参数类型
 */
export type FunctionArgs = unknown[];

/**
 * 日期字符串类型
 */
export type DateString = string;

/**
 * 股票代码类型
 */
export type StockSymbol = string;
