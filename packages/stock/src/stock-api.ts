import type {
  StockHistoryResponse,
  StockRealtimeResponse,
  StockInfoResponse,
  StockBasicInfoResponse,
} from '@halo/models';

import { SimplePythonBridge } from './simple_bridge';

/**
 * 股票数据API类
 * 提供统一的股票数据查询接口
 */
export class StockAPI {
  private static pythonBridge = new SimplePythonBridge();

  /**
   * 获取所有A股股票基本信息
   * @returns Promise<StockInfoResponse>
   */
  static async getAllStocksInfo(): Promise<StockInfoResponse> {
    try {
      const result = await this.pythonBridge.getAllStocksInfo();
      return JSON.parse(result);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 获取股票历史K线数据
   * @param symbol 股票代码，如 "000001"
   * @param startDate 开始日期，格式 "YYYY-MM-DD"，可选
   * @param endDate 结束日期，格式 "YYYY-MM-DD"，可选
   * @returns Promise<StockHistoryResponse>
   */
  static async getStockHistory(
    symbol: string,
    startDate?: number,
    endDate?: number
  ): Promise<StockHistoryResponse> {
    try {
      const result = await this.pythonBridge.getStockHistory(
        symbol,
        toDateString(startDate),
        toDateString(endDate)
      );
      return JSON.parse(result);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        symbol,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 获取股票实时数据
   * @param symbol 股票代码，如 "000001"
   * @returns Promise<StockRealtimeResponse>
   */
  static async getStockRealtime(symbol: string): Promise<StockRealtimeResponse> {
    try {
      const result = await this.pythonBridge.getStockRealtime(symbol);
      return JSON.parse(result);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        symbol,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 获取个股基本信息（东方财富数据源）
   * 注意：原计划使用雪球API，但由于akshare雪球API存在问题，实际使用东方财富API
   * @param symbol 股票代码，如 "000001"
   * @returns Promise<StockBasicInfoResponse>
   */
  static async getStockIndividualBasicInfoXq(symbol: string): Promise<StockBasicInfoResponse> {
    try {
      const result = await this.pythonBridge.getStockIndividualBasicInfoXq(symbol);
      return JSON.parse(result);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        symbol,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

const toDateString = (timestamp?: number) => {
  if (!timestamp) return;
  const date = new Date(timestamp);
  return [
    date.getFullYear().toString().padStart(4, '0'),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getDate().toString().padStart(2, '0'),
  ].join('');
};
