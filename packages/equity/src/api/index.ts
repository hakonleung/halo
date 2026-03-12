import type {
  EquityDailyBar,
  EquitySearchResult,
  EquityStock,
  EquityStockSummary,
  FindSimilarRequest,
  PatternMatch,
} from '../types';

type ApiResponse<T> = { data: T } | { error: string };

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const equityApi = {
  async getStocks(): Promise<EquityStock[]> {
    const res: ApiResponse<EquityStock[]> = await fetchApi('/api/equity/stocks');
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
    const res: ApiResponse<EquityStock> = await fetchApi('/api/equity/stocks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if ('error' in res) throw new Error(res.error);
    return res.data;
  },

  async deleteStock(code: string): Promise<void> {
    await fetchApi(`/api/equity/stocks/${code}`, { method: 'DELETE' });
  },

  async getDailyBars(code: string, limit = 365): Promise<EquityDailyBar[]> {
    const res: ApiResponse<EquityDailyBar[]> = await fetchApi(
      `/api/equity/stocks/${code}?limit=${limit}`,
    );
    if ('error' in res) throw new Error(res.error);
    return res.data;
  },

  async searchStocks(q: string): Promise<EquitySearchResult[]> {
    const res: ApiResponse<EquitySearchResult[]> = await fetchApi(
      `/api/equity/search?q=${encodeURIComponent(q)}`,
    );
    if ('error' in res) throw new Error(res.error);
    return res.data;
  },

  async getSummary(): Promise<EquityStockSummary[]> {
    const res: ApiResponse<EquityStockSummary[]> = await fetchApi('/api/equity/summary');
    if ('error' in res) throw new Error(res.error);
    return res.data;
  },

  async findSimilarPatterns(req: FindSimilarRequest): Promise<PatternMatch[]> {
    const res: ApiResponse<PatternMatch[]> = await fetchApi('/api/equity/similar', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    if ('error' in res) throw new Error(res.error);
    return res.data;
  },
};
