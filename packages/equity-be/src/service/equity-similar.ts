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

type SimilarMatchRaw = {
  code: string;
  startDate: string;
  endDate: string;
  similarity: number;
  totalReturn: number;
  queryTotalReturn: number;
};

type SimilarEvent =
  | ({ type: 'match' } & SimilarMatchRaw)
  | { type: 'done'; total: number; topMatches: SimilarMatchRaw[] };

/** Find similar patterns: DB reads → Python numpy → stream matches */
export async function findSimilarStream(
  supabase: SupabaseClient<Database>,
  code: string,
  startDate: string,
  endDate: string,
): Promise<Response> {
  return makeNdjsonStream(async (controller) => {
    const emit = makeEmit(controller);
    const db = createDb(supabase);
    try {
      const queryBars = await db.getBars([code], { startDate, endDate });
      if (queryBars.length < 2) {
        emit({ type: 'done', total: 0, topMatches: [] });
        controller.close();
        return;
      }
      const queryCloses = queryBars.map((r) => r.close);

      const allStocks = await db.getStockInfos();
      const nameMap = Object.fromEntries(allStocks.map((s) => [s.code, s.name]));

      const sinceDate = subtractDays(formatDate(new Date()), 90);
      emit({ type: 'status', message: '正在加载全量股票数据...' });
      // getBars already applies startDate at the DB/cache layer — no need to re-filter.
      const allBars = await db.getBars([], { startDate: sinceDate });

      // Group bars by code
      const stockMap = groupBarsByCode(allBars, code);
      const stocks = Object.entries(stockMap).map(([c, bars]) => ({ code: c, bars }));

      emit({ type: 'status', message: `正在计算相似度，共 ${stocks.length} 只股票...` });

      const pythonInput = { window_len: queryBars.length, query_closes: queryCloses, stocks };

      await processNdjsonLines<SimilarEvent>(
        SCRIPT,
        ['find_similar'],
        JSON.stringify(pythonInput),
        async (obj) => {
          if (obj.type === 'match') {
            emit({
              type: 'match',
              code: obj.code,
              name: nameMap[obj.code] ?? '',
              startDate: obj.startDate,
              endDate: obj.endDate,
              similarity: obj.similarity,
              totalReturn: obj.totalReturn,
              queryTotalReturn: obj.queryTotalReturn,
            });
          } else if (obj.type === 'done') {
            emit({
              type: 'done',
              total: obj.total,
              topMatches: obj.topMatches.map((m) => ({
                code: m.code,
                name: nameMap[m.code] ?? '',
                startDate: m.startDate,
                endDate: m.endDate,
                similarity: m.similarity,
                totalReturn: m.totalReturn,
                queryTotalReturn: m.queryTotalReturn,
              })),
            });
          }
        },
      );

      controller.close();
    } catch (err) {
      controller.error(err);
    }
  });
}
