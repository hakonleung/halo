import { findScanStream } from './equity-scan';
import { findSimilarStream } from './equity-similar';
import { createDb } from './equity-stream-utils';
import { syncAllStream } from './equity-sync';

import type { Database } from '@neo-log/be-edge';
import type { SupabaseClient } from '@supabase/supabase-js';

export { formatDate, subtractDays } from './equity-stream-utils';

export { syncAllStream, findSimilarStream, findScanStream };

export const equityService = {
  getStocks: (supabase: SupabaseClient<Database>) => createDb(supabase).getStockInfos(),

  deleteStock: (supabase: SupabaseClient<Database>, code: string) =>
    createDb(supabase).deleteStock(code),

  getDailyBars: (supabase: SupabaseClient<Database>, code: string, limit = 365) =>
    createDb(supabase).getBars([code], { limit }),

  syncAllStream,
  findSimilarStream,
  findScanStream,
};
