import type { neologEquityDaily, neologEquityList } from '@neo-log/be-core';
import type { InferSelectModel } from 'drizzle-orm';

export type EquityStockModel = InferSelectModel<typeof neologEquityList>;
export type EquityDailyBarModel = InferSelectModel<typeof neologEquityDaily>;

export interface AddStockRequest {
  code: string;
  name: string;
  market: 'SH' | 'SZ';
  secid: string;
  industry?: string;
}

export interface SyncResult {
  code: string;
  inserted: number;
  latestDate: string | null;
}

// Eastmoney search result
export interface EastmoneySearchItem {
  code: string;
  name: string;
  secid: string; // e.g. '0.000001'
  market: 'SH' | 'SZ';
  industry?: string;
}
