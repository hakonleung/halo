import { BaseApiService } from './base';

import type { ApiResponse } from './base';
import type {
  EquityDailyBar,
  EquitySearchResult,
  EquityStock,
  EquityStockSummary,
  FindSimilarRequest,
  PatternMatch,
} from '@/client/types/equity-client';

export const equityApi = {
  async getStocks(): Promise<EquityStock[]> {
    const res: ApiResponse<EquityStock[]> = await BaseApiService.fetchApi('/api/equity/stocks');
    if ('error' in res) throw new Error(res.error);
    return res.data;
  },

  async addStock(payload: {
    code: string;
    name: string;
    market: 'SH' | 'SZ' | 'BJ';
    secid: string;
    industry?: string;
  }): Promise<EquityStock> {
    const res: ApiResponse<EquityStock> = await BaseApiService.fetchApi('/api/equity/stocks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if ('error' in res) throw new Error(res.error);
    return res.data;
  },

  async deleteStock(code: string): Promise<void> {
    await BaseApiService.fetchApi(`/api/equity/stocks/${code}`, { method: 'DELETE' });
  },

  async getDailyBars(code: string, limit = 365): Promise<EquityDailyBar[]> {
    const res: ApiResponse<EquityDailyBar[]> = await BaseApiService.fetchApi(
      `/api/equity/stocks/${code}?limit=${limit}`,
    );
    if ('error' in res) throw new Error(res.error);
    return res.data;
  },

  async searchStocks(q: string): Promise<EquitySearchResult[]> {
    const res: ApiResponse<EquitySearchResult[]> = await BaseApiService.fetchApi(
      `/api/equity/search?q=${encodeURIComponent(q)}`,
    );
    if ('error' in res) throw new Error(res.error);
    return res.data;
  },

  async getSummary(): Promise<EquityStockSummary[]> {
    const res: ApiResponse<EquityStockSummary[]> =
      await BaseApiService.fetchApi('/api/equity/summary');
    if ('error' in res) throw new Error(res.error);
    return res.data;
  },

  async findSimilarPatterns(req: FindSimilarRequest): Promise<PatternMatch[]> {
    const res: ApiResponse<PatternMatch[]> = await BaseApiService.fetchApi('/api/equity/similar', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    if ('error' in res) throw new Error(res.error);
    return res.data;
  },
};
