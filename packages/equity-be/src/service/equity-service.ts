import path from 'path';

import { createNdjsonResponse, processNdjsonLines, runPython } from '@neo-log/be-core';

import type { Database } from '@neo-log/be-edge';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { DailyBarRecord } from './equity-db';
import { EquityDb } from './equity-db';
import { defaultCache, withCache } from './equity-cache';

const SCRIPT = path.resolve(process.cwd(), 'packages/equity-be/scripts/equity_bridge.py');

// ── date helpers ────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - days);
  return formatDate(d);
}

// ── service ────────────────────────────────────────────────────────────────

export const equityService = {
  getStocks: (supabase: SupabaseClient<Database>) => new EquityDb(supabase).fetchAllStocks(),

  deleteStock: (supabase: SupabaseClient<Database>, code: string) =>
    new EquityDb(supabase).deleteStock(code),

  getDailyBars: (supabase: SupabaseClient<Database>, code: string, limit = 365) =>
    new EquityDb(supabase).getDailyBars(code, limit),

  /** Sync all stocks: DB reads → Python concurrent fetch → batched DB writes, stream progress */
  async syncAllStream(supabase: SupabaseClient<Database>): Promise<Response> {
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const enc = new TextEncoder();
        const emit = (obj: object) => controller.enqueue(enc.encode(JSON.stringify(obj) + '\n'));
        const db = withCache(new EquityDb(supabase), defaultCache);
        let errorHandled = false;
        try {
          const allStocks = await db.fetchAllStocks();

          // ── init flow: stock list is empty, seed it first ──────────────────
          if (allStocks.length === 0) {
            emit({ type: 'status', message: '正在从 akshare 获取 A 股列表...' });
            const raw = await runPython<
              Array<{ code: string; name: string; market: string; secid: string }>
            >(SCRIPT, ['fetch_list']);

            const validStocks = raw
              .filter((s) => s.market === 'SH' || s.market === 'SZ')
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              .map((s) => ({ ...s, market: s.market as 'SH' | 'SZ' }));

            emit({ type: 'status', message: `共 ${validStocks.length} 只股票，写入数据库中...` });
            const CHUNK = 500;
            const totalBatches = Math.ceil(validStocks.length / CHUNK);
            for (let i = 0; i < validStocks.length; i += CHUNK) {
              await db.upsertStockList(validStocks.slice(i, i + CHUNK));
              emit({ type: 'init_progress', batch: i / CHUNK + 1, total_batches: totalBatches });
            }
            emit({ type: 'init_done', total: validStocks.length });
            emit({ type: 'done', synced: 0 });
            controller.close();
            return;
          }

          // ── sync flow: fetch klines for all stocks ─────────────────────────
          const nameMap: Record<string, string> = {};
          for (const s of allStocks) nameMap[s.code] = s.name;

          const { date: latestDay } = await runPython<{ date: string | null }>(SCRIPT, [
            'latest_trading_day',
          ]);

          let upToDate = new Set<string>();
          if (latestDay) {
            emit({ type: 'status', message: `最近交易日: ${latestDay}，查询已同步股票...` });
            upToDate = await db.getUpToDateCodes(latestDay);
          }

          const candidates = allStocks.filter((s) => !upToDate.has(s.code));
          emit({
            type: 'status',
            message: `共 ${allStocks.length} 只，需同步 ${candidates.length} 只（跳过 ${upToDate.size} 只）`,
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

          // Batch DB writes every SYNC_BATCH stocks to reduce round trips
          const SYNC_BATCH = 50;
          const batchBars: DailyBarRecord[] = [];
          const batchCodes: string[] = [];

          const flushBatch = async () => {
            // upsertBars also appends to the cache (write-through via withCache)
            await db.upsertBars(batchBars);
            await db.markSynced(batchCodes);
            batchBars.length = 0;
            batchCodes.length = 0;
          };

          let done = 0;
          const syncTotal = candidates.length;

          await processNdjsonLines(
            SCRIPT,
            ['fetch_all_klines'],
            JSON.stringify(pythonInput),
            async (obj) => {
              if (obj['type'] === 'result') {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                const { code, bars } = obj as {
                  type: 'result';
                  code: string;
                  bars: DailyBarRecord[];
                };
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
              } else if (obj['type'] === 'error') {
                // Flush buffered batch so progress so far is saved
                await flushBatch();
                // Forward structured error to frontend before stopping
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                emit({
                  type: 'error',
                  message: obj['message'] as string,
                  resume_from: obj['resume_from'] as number,
                });
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
      },
    });
    return createNdjsonResponse(stream);
  },

  /** Find similar patterns: DB reads → Python numpy → stream matches */
  async findSimilarStream(
    supabase: SupabaseClient<Database>,
    code: string,
    startDate: string,
    endDate: string,
  ): Promise<Response> {
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const enc = new TextEncoder();
        const emit = (obj: object) => controller.enqueue(enc.encode(JSON.stringify(obj) + '\n'));
        const db = withCache(new EquityDb(supabase), defaultCache);
        try {
          const queryBars = await db.getQueryBars(code, startDate, endDate);
          if (queryBars.length < 2) {
            emit({ type: 'done', total: 0, topMatches: [] });
            controller.close();
            return;
          }
          const queryCloses = queryBars.map((r) => r.close);

          emit({ type: 'status', message: '正在加载股票名称...' });
          const nameMap = await db.getNameMap();

          const sinceDate = subtractDays(formatDate(new Date()), 90);
          emit({ type: 'status', message: '正在加载全量股票数据...' });
          const rawBars = await db.getRecentBars(sinceDate);

          // Filter and exclude query stock in memory
          const allBars = rawBars.filter((b) => b.trade_date >= sinceDate && b.code !== code);

          // Group bars by stock code
          const stockMap: Record<string, { dates: string[]; closes: number[] }> = {};
          for (const bar of allBars) {
            if (!stockMap[bar.code]) stockMap[bar.code] = { dates: [], closes: [] };
            stockMap[bar.code].dates.push(bar.trade_date);
            stockMap[bar.code].closes.push(bar.close);
          }
          const stocks = Object.entries(stockMap).map(([c, v]) => ({ code: c, ...v }));

          emit({ type: 'status', message: `正在计算相似度，共 ${stocks.length} 只股票...` });

          const pythonInput = { window_len: queryBars.length, query_closes: queryCloses, stocks };

          await processNdjsonLines(
            SCRIPT,
            ['find_similar'],
            JSON.stringify(pythonInput),
            async (obj) => {
              if (obj['type'] === 'match') {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                const matchCode = obj['code'] as string;
                emit({
                  type: 'match',
                  code: matchCode,
                  name: nameMap[matchCode] ?? '',
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  startDate: obj['startDate'] as string,
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  endDate: obj['endDate'] as string,
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  similarity: obj['similarity'] as number,
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  totalReturn: obj['totalReturn'] as number,
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  queryTotalReturn: obj['queryTotalReturn'] as number,
                });
              } else if (obj['type'] === 'done') {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                const rawMatches = obj['topMatches'] as Array<Record<string, unknown>>;
                emit({
                  type: 'done',
                  total: obj['total'],
                  topMatches: (rawMatches ?? []).map((m) => {
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    const c = m['code'] as string;
                    return {
                      code: c,
                      name: nameMap[c] ?? '',
                      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                      startDate: m['startDate'] as string,
                      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                      endDate: m['endDate'] as string,
                      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                      similarity: m['similarity'] as number,
                      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                      totalReturn: m['totalReturn'] as number,
                      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                      queryTotalReturn: m['queryTotalReturn'] as number,
                    };
                  }),
                });
              }
            },
          );

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });
    return createNdjsonResponse(stream);
  },

  /** Scan all stocks with a non-range strategy (breakout, divergence, multi-tf, etc.) */
  async findScanStream(
    supabase: SupabaseClient<Database>,
    strategy: string,
    excludeCode: string,
  ): Promise<Response> {
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const enc = new TextEncoder();
        const emit = (obj: object) => controller.enqueue(enc.encode(JSON.stringify(obj) + '\n'));
        const db = withCache(new EquityDb(supabase), defaultCache);
        try {
          emit({ type: 'status', message: '正在加载股票名称...' });
          const nameMap = await db.getNameMap();

          const sinceDate = subtractDays(formatDate(new Date()), 90);
          emit({ type: 'status', message: `正在加载全量 OHLCV 数据...` });
          const allBars = await db.getRecentBarsOHLCV(sinceDate);

          // Group by stock code
          const stockMap: Record<
            string,
            { dates: string[]; opens: number[]; highs: number[]; lows: number[]; closes: number[]; volumes: number[] }
          > = {};
          for (const bar of allBars) {
            if (bar.code === excludeCode) continue;
            if (!stockMap[bar.code]) {
              stockMap[bar.code] = { dates: [], opens: [], highs: [], lows: [], closes: [], volumes: [] };
            }
            stockMap[bar.code].dates.push(bar.trade_date);
            stockMap[bar.code].opens.push(bar.open);
            stockMap[bar.code].highs.push(bar.high);
            stockMap[bar.code].lows.push(bar.low);
            stockMap[bar.code].closes.push(bar.close);
            stockMap[bar.code].volumes.push(bar.volume);
          }
          const stocks = Object.entries(stockMap).map(([c, v]) => ({ code: c, ...v }));

          emit({ type: 'status', message: `正在扫描 ${stocks.length} 只股票...` });
          const pythonInput = { stocks };

          await processNdjsonLines(SCRIPT, [strategy], JSON.stringify(pythonInput), async (obj) => {
            if (obj['type'] === 'match') {
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              const matchCode = obj['code'] as string;
              emit({ ...obj, name: nameMap[matchCode] ?? '' });
            } else if (obj['type'] === 'done') {
              emit(obj);
            }
          });

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });
    return createNdjsonResponse(stream);
  },
};
