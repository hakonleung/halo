import path from 'path';

import { createNdjsonResponse, processNdjsonLines, runPython } from '@neo-log/be-core';

import type { SyncResult } from '../types/server';
import type { Database } from '@neo-log/be-edge';
import type { SupabaseClient } from '@supabase/supabase-js';

const SCRIPT = path.resolve(process.cwd(), 'packages/equity-be/scripts/equity_bridge.py');

// ── internal types ─────────────────────────────────────────────────────────

interface DailyBarRecord {
  code: string;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amount: number | null;
  amplitude: number | null;
  change_pct: number | null;
  change_amount: number | null;
  turnover_rate: number | null;
}

// ── helpers ────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - days);
  return formatDate(d);
}

async function fetchAllStocks(supabase: SupabaseClient<Database>) {
  const all: Array<{ code: string; name: string; secid: string; last_synced_at: string | null }> =
    [];
  const pageSize = 1000;
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from('neolog_equity_list')
      .select('code,name,secid,last_synced_at')
      .range(offset, offset + pageSize - 1);
    const batch = data ?? [];
    all.push(...batch);
    if (batch.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

async function getUpToDateCodes(
  supabase: SupabaseClient<Database>,
  tradeDate: string,
): Promise<Set<string>> {
  const codes = new Set<string>();
  const pageSize = 1000;
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from('neolog_equity_daily')
      .select('code')
      .eq('trade_date', tradeDate)
      .range(offset, offset + pageSize - 1);
    const batch = data ?? [];
    for (const r of batch) codes.add(r.code);
    if (batch.length < pageSize) break;
    offset += pageSize;
  }
  return codes;
}

async function upsertBars(
  supabase: SupabaseClient<Database>,
  bars: DailyBarRecord[],
): Promise<void> {
  const BATCH = 500;
  for (let i = 0; i < bars.length; i += BATCH) {
    await supabase
      .from('neolog_equity_daily')
      .upsert(bars.slice(i, i + BATCH), { onConflict: 'code,trade_date' });
  }
}

// ── service ────────────────────────────────────────────────────────────────

export const equityService = {
  async getStocks(supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
      .from('neolog_equity_list')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteStock(supabase: SupabaseClient<Database>, code: string) {
    await supabase.from('neolog_equity_daily').delete().eq('code', code);
    const { error } = await supabase.from('neolog_equity_list').delete().eq('code', code);
    if (error) throw new Error(error.message);
  },

  async getDailyBars(supabase: SupabaseClient<Database>, code: string, limit = 365) {
    const { data, error } = await supabase
      .from('neolog_equity_daily')
      .select('*')
      .eq('code', code)
      .order('trade_date', { ascending: true })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data;
  },

  /** Sync one stock: DB read → Python fetch → DB write */
  async syncStock(
    supabase: SupabaseClient<Database>,
    stock: { code: string; secid: string; name: string },
  ): Promise<SyncResult> {
    const { data: latestRow } = await supabase
      .from('neolog_equity_daily')
      .select('trade_date')
      .eq('code', stock.code)
      .order('trade_date', { ascending: false })
      .limit(1);
    const latest = latestRow?.[0]?.trade_date ?? null;

    const today = formatDate(new Date());
    const startDate = latest ? subtractDays(latest, -1) : subtractDays(today, 365);
    if (startDate > today) return { code: stock.code, inserted: 0, latestDate: latest };

    const bars = await runPython<DailyBarRecord[]>(SCRIPT, [
      'fetch_kline',
      stock.code,
      startDate.replace(/-/g, ''),
      today.replace(/-/g, ''),
    ]);

    if (bars.length > 0) {
      await upsertBars(supabase, bars);
      const now = new Date().toISOString();
      await supabase
        .from('neolog_equity_list')
        .update({ last_synced_at: now, updated_at: now })
        .eq('code', stock.code);
    }
    return {
      code: stock.code,
      inserted: bars.length,
      latestDate: bars.length > 0 ? bars[bars.length - 1].trade_date : latest,
    };
  },

  /** Sync all stocks: orchestrate DB reads, Python concurrent fetch, DB writes, stream progress */
  async syncAllStream(supabase: SupabaseClient<Database>): Promise<Response> {
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const enc = new TextEncoder();
        const emit = (obj: object) => controller.enqueue(enc.encode(JSON.stringify(obj) + '\n'));
        try {
          const countRes = await supabase
            .from('neolog_equity_list')
            .select('id', { count: 'exact', head: true });
          const listCount = countRes.count ?? 0;

          if (listCount === 0) {
            // ── init flow ──────────────────────────────────────────────
            emit({ type: 'status', message: '正在从 akshare 获取 A 股列表...' });
            const stocks = await runPython<
              Array<{ code: string; name: string; market: string; secid: string }>
            >(SCRIPT, ['fetch_list']);
            emit({ type: 'status', message: `共 ${stocks.length} 只股票，写入数据库中...` });
            const BATCH = 500;
            // Filter to DB-supported markets and cast
            const validStocks = stocks.filter((s) => s.market === 'SH' || s.market === 'SZ');
            const totalBatches = Math.ceil(validStocks.length / BATCH);
            for (let i = 0; i < validStocks.length; i += BATCH) {
              await supabase.from('neolog_equity_list').upsert(
                validStocks.slice(i, i + BATCH).map((s) => ({
                  code: s.code,
                  name: s.name,
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  market: s.market as 'SH' | 'SZ',
                  secid: s.secid,
                  updated_at: new Date().toISOString(),
                })),
                { onConflict: 'code' },
              );
              emit({
                type: 'init_progress',
                batch: Math.floor(i / BATCH) + 1,
                total_batches: totalBatches,
              });
            }
            emit({ type: 'init_done', total: validStocks.length });
            emit({ type: 'done', synced: 0 });
            controller.close();
            return;
          }

          // ── sync flow ──────────────────────────────────────────────
          const allStocks = await fetchAllStocks(supabase);
          const nameMap: Record<string, string> = {};
          for (const s of allStocks) nameMap[s.code] = s.name;

          const { date: latestDay } = await runPython<{ date: string | null }>(SCRIPT, [
            'latest_trading_day',
          ]);

          let upToDate = new Set<string>();
          if (latestDay) {
            emit({ type: 'status', message: `最近交易日: ${latestDay}，查询已同步股票...` });
            upToDate = await getUpToDateCodes(supabase, latestDay);
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
                ? subtractDays(s.last_synced_at.split('T')[0], 7)
                : oneYearAgo,
            })),
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
                  await upsertBars(supabase, bars);
                  const now = new Date().toISOString();
                  await supabase
                    .from('neolog_equity_list')
                    .update({ last_synced_at: now, updated_at: now })
                    .eq('code', code);
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
              } else if (obj['type'] === 'error') {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                const { code, message } = obj as { type: 'error'; code: string; message: string };
                done++;
                emit({
                  type: 'progress',
                  code,
                  name: nameMap[code] ?? '',
                  inserted: 0,
                  latestDate: null,
                  error: message,
                  index: done,
                  total: syncTotal,
                });
              }
            },
          );

          emit({ type: 'done', synced: syncTotal });
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });
    return createNdjsonResponse(stream);
  },

  /** Find similar patterns: DB reads → Python numpy computation → stream matches */
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
        try {
          const { data: queryRows } = await supabase
            .from('neolog_equity_daily')
            .select('trade_date,close')
            .eq('code', code)
            .gte('trade_date', startDate)
            .lte('trade_date', endDate)
            .order('trade_date');

          const windowLen = queryRows?.length ?? 0;
          if (windowLen < 2) {
            emit({ type: 'done', total: 0, topMatches: [] });
            controller.close();
            return;
          }
          const queryCloses = (queryRows ?? []).map((r) => r.close);

          const { data: nameRows } = await supabase.from('neolog_equity_list').select('code,name');
          const nameMap: Record<string, string> = {};
          for (const r of nameRows ?? []) nameMap[r.code] = r.name;

          emit({ type: 'status', message: '正在加载全量股票近6个月数据...' });
          const sixMonthsAgo = subtractDays(formatDate(new Date()), 180);
          const allBars: Array<{ code: string; trade_date: string; close: number }> = [];
          const PAGE = 9999;
          let offset = 0;
          while (true) {
            const { data: batch } = await supabase
              .from('neolog_equity_daily')
              .select('code,trade_date,close')
              .neq('code', code)
              .gte('trade_date', sixMonthsAgo)
              .order('code')
              .order('trade_date')
              .range(offset, offset + PAGE - 1);
            const b = batch ?? [];
            allBars.push(...b);
            if (b.length < PAGE) break;
            offset += PAGE;
          }

          const stockMap: Record<string, { dates: string[]; closes: number[] }> = {};
          for (const bar of allBars) {
            if (!stockMap[bar.code]) stockMap[bar.code] = { dates: [], closes: [] };
            stockMap[bar.code].dates.push(bar.trade_date);
            stockMap[bar.code].closes.push(bar.close);
          }
          const stocks = Object.entries(stockMap).map(([c, v]) => ({
            code: c,
            dates: v.dates,
            closes: v.closes,
          }));

          emit({ type: 'status', message: `正在计算相似度，共 ${stocks.length} 只股票...` });

          const pythonInput = { window_len: windowLen, query_closes: queryCloses, stocks };

          await processNdjsonLines(
            SCRIPT,
            ['find_similar'],
            JSON.stringify(pythonInput),
            async (obj) => {
              if (obj['type'] === 'match') {
                const match = {
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  code: obj['code'] as string,
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  name: nameMap[obj['code'] as string] ?? '',
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  startDate: obj['startDate'] as string,
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  endDate: obj['endDate'] as string,
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  similarity: obj['similarity'] as number,
                };
                emit({ type: 'match', ...match });
              } else if (obj['type'] === 'done') {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                const rawMatches = obj['topMatches'] as Array<Record<string, unknown>>;
                const topMatches = (rawMatches ?? []).map((m) => ({
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  code: m['code'] as string,
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  name: nameMap[m['code'] as string] ?? '',
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  startDate: m['startDate'] as string,
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  endDate: m['endDate'] as string,
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  similarity: m['similarity'] as number,
                }));
                emit({ type: 'done', total: obj['total'], topMatches });
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
};
