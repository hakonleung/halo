import type {
  EquityDailyBar,
  EquitySearchResult,
  EquityStock,
  EquityStockSummary,
  FindSimilarRequest,
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

/** Read a streaming NDJSON response line by line, calling `onLine` for each parsed object. */
async function streamNdjson(
  url: string,
  body: object,
  onLine: (event: Record<string, unknown>) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.body) return;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        onLine(JSON.parse(trimmed));
      } catch {
        // ignore malformed lines
      }
    }
  }
}

export const equityApi = {
  async getStocks(): Promise<EquityStock[]> {
    const res: ApiResponse<EquityStock[]> = await fetchApi('/api/equity/stocks');
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

  streamSync(
    body: object,
    onLine: (event: Record<string, unknown>) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    return streamNdjson('/api/equity/sync', body, onLine, signal);
  },

  streamSimilar(
    req: FindSimilarRequest,
    onLine: (event: Record<string, unknown>) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    return streamNdjson('/api/equity/similar', req, onLine, signal);
  },
};
