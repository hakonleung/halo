import { processNdjsonLines } from '@neo-log/be-core';

import {
  SCRIPT,
  createDb,
  formatDate,
  groupBarsByCode,
  makeEmit,
  makeNdjsonStream,
  subtractDays,
} from './equity-stream-utils';

import type { Database } from '@neo-log/be-edge';
import type { SupabaseClient } from '@supabase/supabase-js';

type ScanEvent = { type: string; code?: string; [key: string]: unknown };

/** Scan all stocks with a non-range strategy (breakout, divergence, multi-tf, etc.) */
export async function findScanStream(
  supabase: SupabaseClient<Database>,
  strategy: string,
  excludeCode: string,
): Promise<Response> {
  return makeNdjsonStream(async (controller) => {
    const emit = makeEmit(controller);
    const db = createDb(supabase);
    try {
      const allStocks = await db.getStockInfos();
      const nameMap = Object.fromEntries(allStocks.map((s) => [s.code, s.name]));

      const sinceDate = subtractDays(formatDate(new Date()), 90);
      emit({ type: 'status', message: '正在加载全量 OHLCV 数据...' });
      const allBars = await db.getBars([], { startDate: sinceDate });

      // Group bars by code
      const stockMap = groupBarsByCode(allBars, excludeCode);
      const stocks = Object.entries(stockMap).map(([c, bars]) => ({ code: c, bars }));

      emit({ type: 'status', message: `正在扫描 ${stocks.length} 只股票...` });
      const pythonInput = { stocks };

      await processNdjsonLines<ScanEvent>(SCRIPT, [strategy], JSON.stringify(pythonInput), async (obj) => {
        if (obj.type === 'match') {
          emit({ ...obj, name: nameMap[obj.code ?? ''] ?? '' });
        } else if (obj.type === 'done') {
          emit(obj);
        }
      });

      controller.close();
    } catch (err) {
      controller.error(err);
    }
  });
}
