import { useMemo } from 'react';
import useSWR from 'swr';
import type { StockPricesResponse, StockPricesParams } from '../types/stock';
import { apiRequest, buildQueryString } from '../api/client';

/**
 * 获取股票价格数据的fetcher函数
 */
const fetchStockPrices = async (url: string): Promise<StockPricesResponse> => {
  return apiRequest<StockPricesResponse>(url);
};

/**
 * 构建股票价格API的URL
 */
const buildStockPricesUrl = (params: StockPricesParams): string => {
  const { symbols, ...restParams } = params;

  const queryParams = {
    symbols: Array.isArray(symbols) ? symbols.join(',') : symbols,
    ...restParams,
  };

  const queryString = buildQueryString(queryParams);
  return `/api/stock-prices?${queryString}`;
};

/**
 * useStockPrices hook
 *
 * 获取股票价格数据的hook
 *
 * @param params 查询参数
 * @param options SWR配置选项
 * @returns SWR返回对象，包含价格数据、加载状态、错误信息等
 */
export function useStockPrices(
  params: StockPricesParams,
  options?: {
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
    enabled?: boolean;
  }
) {
  const url = useMemo(() => {
    // 如果没有提供symbols参数，则不发起请求
    const shouldFetch =
      params.symbols &&
      (Array.isArray(params.symbols) ? params.symbols.length > 0 : params.symbols.length > 0) &&
      options?.enabled !== false;

    return shouldFetch ? buildStockPricesUrl(params) : undefined;
  }, [params, options?.enabled]);

  return useSWR(url, fetchStockPrices, {
    // 默认配置
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 0,
    // 用户自定义配置
    ...options,
  });
}

/**
 * useStockPricesRealtime hook
 *
 * 实时获取股票价格数据的hook（自动刷新）
 *
 * @param symbols 股票代码列表
 * @param options 配置选项
 * @returns 股票价格数据
 */
export function useStockPricesRealtime(
  symbols: string | string[],
  options?: {
    limit?: number;
    refreshInterval?: number;
    enabled?: boolean;
  }
) {
  const params = useMemo(
    () => ({
      symbols,
      limit: options?.limit || 1,
    }),
    [symbols, options?.limit]
  );

  const swrOptions = useMemo(
    () => ({
      refreshInterval: options?.refreshInterval || 10000, // 默认10秒刷新
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      enabled: options?.enabled,
    }),
    [options?.refreshInterval, options?.enabled]
  );

  return useStockPrices(params, swrOptions);
}

/**
 * useStockPricesHistory hook
 *
 * 获取股票历史价格数据的hook
 *
 * @param symbol 股票代码
 * @param dateRange 日期范围
 * @param options 配置选项
 * @returns 历史价格数据
 */
export function useStockPricesHistory(
  symbol: string,
  dateRange: {
    startDate?: string;
    endDate?: string;
  },
  options?: {
    limit?: number;
    enabled?: boolean;
  }
) {
  const params = useMemo(
    () => ({
      symbols: symbol,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      limit: options?.limit,
    }),
    [symbol, dateRange.startDate, dateRange.endDate, options?.limit]
  );

  const swrOptions = useMemo(
    () => ({
      refreshInterval: 0, // 历史数据不自动刷新
      revalidateOnFocus: false,
      enabled: options?.enabled && !!symbol,
    }),
    [options?.enabled, symbol]
  );

  return useStockPrices(params, swrOptions);
}
