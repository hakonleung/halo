import path from 'path';

import { create as createFlatCache } from 'flat-cache';

import type {
  BarQueryOptions,
  DailyBarRecord,
  IEquityDb,
  StockListEntry,
  StockRecord,
} from './equity-db';

// ── cache store interfaces ────────────────────────────────────────────────────

interface StockListStore {
  get(): Promise<StockRecord[] | undefined>;
  set(stocks: StockRecord[]): Promise<void>;
  upsert(entries: StockListEntry[]): Promise<void>;
  delete(code: string): Promise<void>;
  markSynced(codes: string[]): Promise<void>;
}

interface BarsCache {
  byCode: Record<string, DailyBarRecord[]>;
}

interface BarsStore {
  get(): Promise<BarsCache | undefined>;
  set(cache: BarsCache): Promise<void>;
  append(newBars: DailyBarRecord[]): Promise<void>;
  deleteCode(code: string): Promise<void>;
}

interface CacheLayer {
  stocks: StockListStore;
  bars: BarsStore;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function isBJCode(code: string): boolean {
  return code.startsWith('8') || code.startsWith('9');
}

function groupByCode(bars: DailyBarRecord[]): Record<string, DailyBarRecord[]> {
  const byCode: Record<string, DailyBarRecord[]> = {};
  for (const bar of bars) {
    (byCode[bar.code] ??= []).push(bar);
  }
  return byCode;
}

// ── FlatCacheLayer ────────────────────────────────────────────────────────────

const CACHE_DIR = path.resolve(process.cwd(), '.cache/equity');

class FlatCacheLayer implements CacheLayer {
  private stockFlat = createFlatCache({ cacheId: 'stock-list', cacheDir: CACHE_DIR });
  private barsFlat = createFlatCache({ cacheId: 'bars-cache', cacheDir: CACHE_DIR });

  stocks: StockListStore = {
    get: async (): Promise<StockRecord[] | undefined> => {
      return this.stockFlat.getKey('data') ?? undefined;
    },
    set: async (stocks: StockRecord[]): Promise<void> => {
      this.stockFlat.setKey('data', stocks);
      this.stockFlat.save(true);
    },
    upsert: async (entries: StockListEntry[]): Promise<void> => {
      const existing: StockRecord[] = this.stockFlat.getKey('data') ?? [];
      const map = new Map(existing.map((s) => [s.code, s]));
      for (const e of entries) {
        const prev = map.get(e.code);
        map.set(e.code, {
          code: e.code,
          name: e.name,
          secid: e.secid,
          last_synced_at: prev?.last_synced_at ?? null,
        });
      }
      this.stockFlat.setKey('data', Array.from(map.values()));
      this.stockFlat.save(true);
    },
    delete: async (code: string): Promise<void> => {
      const existing: StockRecord[] = this.stockFlat.getKey('data') ?? [];
      this.stockFlat.setKey('data', existing.filter((s) => s.code !== code));
      this.stockFlat.save(true);
    },
    markSynced: async (codes: string[]): Promise<void> => {
      const existing: StockRecord[] | undefined = this.stockFlat.getKey('data');
      if (!existing) return;
      const codeSet = new Set(codes);
      const now = new Date().toISOString();
      this.stockFlat.setKey(
        'data',
        existing.map((s) => (codeSet.has(s.code) ? { ...s, last_synced_at: now } : s)),
      );
      this.stockFlat.save(true);
    },
  };

  bars: BarsStore = {
    get: async (): Promise<BarsCache | undefined> => {
      return this.barsFlat.getKey('data') ?? undefined;
    },
    set: async (cache: BarsCache): Promise<void> => {
      this.barsFlat.setKey('data', cache);
      this.barsFlat.save(true);
    },
    append: async (newBars: DailyBarRecord[]): Promise<void> => {
      const existing: BarsCache | undefined = this.barsFlat.getKey('data');
      if (!existing) return;
      const byCode = { ...existing.byCode };
      for (const bar of newBars) {
        (byCode[bar.code] ??= []).push(bar);
      }
      this.barsFlat.setKey('data', { byCode });
      this.barsFlat.save(true);
    },
    deleteCode: async (code: string): Promise<void> => {
      const existing: BarsCache | undefined = this.barsFlat.getKey('data');
      if (!existing) return;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [code]: _removed, ...byCode } = existing.byCode;
      this.barsFlat.setKey('data', { byCode });
      this.barsFlat.save(true);
    },
  };
}

// ── CachedEquityDb ────────────────────────────────────────────────────────────

class CachedEquityDb implements IEquityDb {
  constructor(
    private db: IEquityDb,
    private cache: CacheLayer,
  ) {}

  // ── cached reads ────────────────────────────────────────────────────────────

  async getStockInfos(): Promise<StockRecord[]> {
    const cached = await this.cache.stocks.get();
    if (cached) return cached.filter((s) => !isBJCode(s.code));
    const fresh = await this.db.getStockInfos();
    await this.cache.stocks.set(fresh);
    return fresh;
  }

  async getBars(codes: string[], options?: BarQueryOptions): Promise<DailyBarRecord[]> {
    const { startDate, endDate, limit } = options ?? {};
    const cached = await this.cache.bars.get();

    // Determine full set of requested codes.
    // When codes=[] and the bar cache already exists, derive the target set
    // directly from the cache keys — avoids an unnecessary getStockInfos() call.
    const targetCodes = (
      codes.length === 0
        ? cached
          ? Object.keys(cached.byCode)
          : (await this.getStockInfos()).map((s) => s.code)
        : codes
    ).filter((c) => !isBJCode(c));

    // Split into cached hits vs DB misses
    const cachedCodes: string[] = [];
    const missingCodes: string[] = [];
    for (const code of targetCodes) {
      const codeBars = cached?.byCode[code];
      const hit = !!codeBars?.length &&
        (startDate ? codeBars[0].trade_date <= startDate : !limit || codeBars.length >= limit);
      (hit ? cachedCodes : missingCodes).push(code);
    }

    // Fetch missing codes from DB and write to cache
    const freshBars =
      missingCodes.length > 0 ? await this.db.getBars(missingCodes, options) : [];
    if (freshBars.length > 0) {
      if (cached) {
        await this.cache.bars.append(freshBars);
      } else {
        await this.cache.bars.set({ byCode: groupByCode(freshBars) });
      }
    }

    // Collect cached bars with options applied.
    // cachedCodes only contains codes that had a cache hit, so cached is non-null here.
    const cachedByCode = cached?.byCode ?? {};
    const result: DailyBarRecord[] = [];
    for (const code of cachedCodes) {
      let bars = cachedByCode[code] ?? [];
      if (startDate) bars = bars.filter((b) => b.trade_date >= startDate);
      if (endDate) bars = bars.filter((b) => b.trade_date <= endDate);
      if (limit && !startDate) bars = bars.slice(-limit);
      result.push(...bars);
    }
    result.push(...freshBars);
    return result;
  }

  // ── write-through ────────────────────────────────────────────────────────────

  async upsertBars(bars: DailyBarRecord[]): Promise<void> {
    await this.db.upsertBars(bars);
    await this.cache.bars.append(bars);
  }

  async upsertStockList(stocks: StockListEntry[]): Promise<void> {
    await this.db.upsertStockList(stocks);
    await this.cache.stocks.upsert(stocks);
  }

  async markSynced(codes: string[]): Promise<void> {
    await this.db.markSynced(codes);
    await this.cache.stocks.markSynced(codes);
  }

  async deleteStock(code: string): Promise<void> {
    await this.db.deleteStock(code);
    await this.cache.stocks.delete(code);
    await this.cache.bars.deleteCode(code);
  }
}

// ── exports ───────────────────────────────────────────────────────────────────

export function withCache(db: IEquityDb, cache: CacheLayer): IEquityDb {
  return new CachedEquityDb(db, cache);
}

export const defaultCache: CacheLayer = new FlatCacheLayer();
