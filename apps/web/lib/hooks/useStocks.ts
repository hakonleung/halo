import { useMemo } from 'react';
import useSWR from 'swr';
import type { StocksResponse } from '../types/stock';
import { apiRequest } from '../api/client';

/**
 * 获取股票基本信息的fetcher函数
 */
const fetchStocks = async (): Promise<StocksResponse> => {
  return apiRequest<StocksResponse>('/api/stocks');
};

/**
 * useStocks hook
 *
 * 获取全部股票基本信息的hook
 *
 * @param options SWR配置选项
 * @returns SWR返回对象，包含股票数据、加载状态、错误信息等
 */
export function useStocks(options?: {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
}) {
  return useSWR('/api/stocks', fetchStocks, {
    // 默认配置
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 0,
    // 用户自定义配置
    ...options,
  });
}

/**
 * 根据关键词搜索股票的hook
 *
 * @param keyword 搜索关键词（股票代码或名称）
 * @param options SWR配置选项
 * @returns 过滤后的股票数据
 */
export function useStockSearch(
  keyword: string,
  options?: {
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
  }
) {
  const swrResult = useStocks(options);

  const filteredStocks = useMemo(() => {
    return (
      swrResult.data?.stocks.filter(stock =>
        keyword
          ? stock.symbol.toLowerCase().includes(keyword.toLowerCase()) ||
            stock.name.toLowerCase().includes(keyword.toLowerCase())
          : true
      ) || []
    );
  }, [swrResult.data?.stocks, keyword]);

  return {
    ...swrResult,
    filteredStocks,
    count: filteredStocks.length,
  };
}
