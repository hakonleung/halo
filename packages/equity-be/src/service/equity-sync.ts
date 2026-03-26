import { processNdjsonLines, runPython } from '@neo-log/be-core';

import {
  SCRIPT,
  createDb,
  formatDate,
  makeEmit,
  makeNdjsonStream,
  subtractDays,
} from './equity-stream-utils';

import type { createDb as CreateDbFn } from './equity-stream-utils';
import type { DailyBarRecord } from './equity-db';

import type { Database } from '@neo-log/be-edge';
import type { SupabaseClient } from '@supabase/supabase-js';

type Db = ReturnType<typeof CreateDbFn>;
const CHUNK = 500;
const SYNC_BATCH = 50;

type Emit = ReturnType<typeof makeEmit>;

type SyncEvent =
  | { type: 'result'; code: string; bars: DailyBarRecord[] }
  | { type: 'error'; message: string; resume_from: number };

/** Sync all stocks: DB reads → Python concurrent fetch → batched DB writes, stream progress */
export async function syncAllStream(supabase: SupabaseClient<Database>): Promise<Response> {
  return makeNdjsonStream(async (controller) => {
    const emit = makeEmit(controller);
    const db = createDb(supabase);
    let errorHandled = false;
    try {
      const allStocks = await db.getStockInfos();

      // ── init flow: stock list is empty, seed it first ──────────────────
      if (allStocks.length === 0) {
        await initStockList(db, emit);
        emit({ type: 'done', synced: 0 });
        controller.close();
        return;
      }

      // ── sync flow: fetch klines for all stocks ─────────────────────────
      const nameMap: Record<string, string> = {};
      for (const s of allStocks) nameMap[s.code] = s.name;

      const latestDay = latestTradingDay();
      const candidates = allStocks.filter(
        (s) => !s.last_synced_at || s.last_synced_at.split('T')[0] < latestDay,
      );
      emit({
        type: 'status',
        message: `最近交易日: ${latestDay}，共 ${allStocks.length} 只，需同步 ${candidates.length} 只（跳过 ${allStocks.length - candidates.length} 只）`,
      });

      if (candidates.length === 0) {
        emit({ type: 'done', synced: 0 });
        controller.close();
        return;
      }

      const oneYearAgo = subtractDays(formatDate(new Date()), 365);
      const pythonInput = {
        stocks: candidates.map((s) => ({
          code: s.code,
          start_date: s.last_synced_at
            ? subtractDays(s.last_synced_at.split('T')[0], 0)
            : oneYearAgo,
        })),
      };

      const batchBars: DailyBarRecord[] = [];
      const batchCodes: string[] = [];

      const flushBatch = async () => {
        await db.upsertBars(batchBars);
        await db.markSynced(batchCodes);
        batchBars.length = 0;
        batchCodes.length = 0;
      };

      let done = 0;
      const syncTotal = candidates.length;

      await processNdjsonLines<SyncEvent>(
        SCRIPT,
        ['fetch_all_klines'],
        JSON.stringify(pythonInput),
        async (obj) => {
          if (obj.type === 'result') {
            const { code, bars } = obj;
            console.log(`[sync] fetched ${code} (${nameMap[code] ?? ''}) → ${bars.length} bars`);
            if (bars.length > 0) {
              batchBars.push(...bars);
              batchCodes.push(code);
            }
            done++;
            emit({
              type: 'progress',
              code,
              name: nameMap[code] ?? '',
              inserted: bars.length,
              latestDate: bars.length > 0 ? bars[bars.length - 1].trade_date : null,
              error: null,
              index: done,
              total: syncTotal,
            });
            if (batchCodes.length >= SYNC_BATCH) await flushBatch();
          } else if (obj.type === 'error') {
            await flushBatch();
            emit({ type: 'error', message: obj.message, resume_from: obj.resume_from });
            errorHandled = true;
            throw new Error('sync_aborted');
          }
        },
      );

      await flushBatch();
      emit({ type: 'done', synced: syncTotal });
      controller.close();
    } catch (err) {
      if (errorHandled) {
        // Error already emitted as structured NDJSON — close cleanly so
        // the frontend can read all enqueued events including the error.
        controller.close();
      } else {
        controller.error(err);
      }
    }
  });
}

/** Returns the most recent weekday (Mon–Fri) up to and including today, as YYYY-MM-DD. */
function latestTradingDay(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun, 6=Sat
  if (day === 0) d.setDate(d.getDate() - 2);
  else if (day === 6) d.setDate(d.getDate() - 1);
  return formatDate(d);
}

/** Seed the stock list from akshare when the DB is empty. */
async function initStockList(db: Db, emit: Emit): Promise<void> {
  emit({ type: 'status', message: '正在从 akshare 获取 A 股列表...' });
  const raw = await runPython<Array<{ code: string; name: string; market: string; secid: string }>>(
    SCRIPT,
    ['fetch_list'],
  );

  const validStocks = raw
    .filter((s) => s.market === 'SH' || s.market === 'SZ')
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    .map((s) => ({ ...s, market: s.market as 'SH' | 'SZ' }));

  emit({ type: 'status', message: `共 ${validStocks.length} 只股票，写入数据库中...` });
  const totalBatches = Math.ceil(validStocks.length / CHUNK);
  for (let i = 0; i < validStocks.length; i += CHUNK) {
    await db.upsertStockList(validStocks.slice(i, i + CHUNK));
    emit({ type: 'init_progress', batch: i / CHUNK + 1, total_batches: totalBatches });
  }
  emit({ type: 'init_done', total: validStocks.length });
}
