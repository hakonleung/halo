import path from 'path';

import { create as createFlatCache } from 'flat-cache';

import type {
  DailyBarRecord,
  IEquityDb,
  OHLCVBar,
  RecentBar,
  StockListEntry,
  StockRecord,
} from './equity-db';

// ── BarsCache ─────────────────────────────────────────────────────────────────

interface BarsCache {
  /** Earliest trade_date stored in this cache. Used to validate coverage. */
  earliestDate: string;
  bars: RecentBar[];
  /** Per-stock latest cached trade_date. Used for incremental append after sync. */
  watermarks: Record<string, string>;
}

// ── CacheLayer ────────────────────────────────────────────────────────────────
// Hierarchical cache — one sub-store per cacheable DB resource.

interface NameMapStore {
  get(): Promise<Record<string, string> | null>;
  set(map: Record<string, string>): Promise<void>;
}

interface RecentBarsStore {
  get(): Promise<BarsCache | null>;
  set(cache: BarsCache): Promise<void>;
  /** Append new bars and update per-stock watermarks without a full rewrite. */
  append(newBars: RecentBar[], watermarks: Record<string, string>): Promise<void>;
}

interface CacheLayer {
  nameMap: NameMapStore;
  recentBars: RecentBarsStore;
}

// ── FlatCacheLayer ────────────────────────────────────────────────────────────

const CACHE_DIR = path.resolve(process.cwd(), '.cache/equity');

class FlatCacheLayer implements CacheLayer {
  private nameMapFlat = createFlatCache({ cacheId: 'name-map', cacheDir: CACHE_DIR });
  private barsFlat = createFlatCache({ cacheId: 'bars-cache', cacheDir: CACHE_DIR });

  nameMap: NameMapStore = {
    get: async (): Promise<Record<string, string> | null> => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return (this.nameMapFlat.getKey('data') as Record<string, string> | undefined) ?? null;
    },
    set: async (map: Record<string, string>): Promise<void> => {
      this.nameMapFlat.setKey('data', map);
      this.nameMapFlat.save(true);
    },
  };

  recentBars: RecentBarsStore = {
    get: async (): Promise<BarsCache | null> => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return (this.barsFlat.getKey('data') as BarsCache | undefined) ?? null;
    },
    set: async (cache: BarsCache): Promise<void> => {
      this.barsFlat.setKey('data', cache);
      this.barsFlat.save(true);
    },
    append: async (
      newBars: RecentBar[],
      updatedWatermarks: Record<string, string>,
    ): Promise<void> => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const existing = (this.barsFlat.getKey('data') as BarsCache | undefined) ?? null;
      if (!existing) return;
      const updated: BarsCache = {
        earliestDate: existing.earliestDate,
        bars: [...existing.bars, ...newBars],
        watermarks: { ...existing.watermarks, ...updatedWatermarks },
      };
      this.barsFlat.setKey('data', updated);
      this.barsFlat.save(true);
    },
  };
}

// ── withCache ─────────────────────────────────────────────────────────────────

class CachedEquityDb implements IEquityDb {
  constructor(
    private db: IEquityDb,
    private cache: CacheLayer,
  ) {}

  // ── pass-through ────────────────────────────────────────────────────────────
  fetchAllStocks(): Promise<StockRecord[]> {
    return this.db.fetchAllStocks();
  }
  getUpToDateCodes(tradeDate: string): Promise<Set<string>> {
    return this.db.getUpToDateCodes(tradeDate);
  }
  getDailyBars(code: string, limit?: number): Promise<DailyBarRecord[]> {
    return this.db.getDailyBars(code, limit);
  }
  getQueryBars(
    code: string,
    startDate: string,
    endDate: string,
  ): Promise<Array<{ trade_date: string; close: number }>> {
    return this.db.getQueryBars(code, startDate, endDate);
  }
  getRecentBarsOHLCV(sinceDate: string): Promise<OHLCVBar[]> {
    return this.db.getRecentBarsOHLCV(sinceDate);
  }
  upsertStockList(stocks: StockListEntry[]): Promise<void> {
    return this.db.upsertStockList(stocks);
  }
  markSynced(codes: string[]): Promise<void> {
    return this.db.markSynced(codes);
  }
  deleteStock(code: string): Promise<void> {
    return this.db.deleteStock(code);
  }

  // ── cached reads ────────────────────────────────────────────────────────────
  async getNameMap(): Promise<Record<string, string>> {
    const cached = await this.cache.nameMap.get();
    if (cached) return cached;
    const fresh = await this.db.getNameMap();
    await this.cache.nameMap.set(fresh);
    return fresh;
  }

  async getRecentBars(sinceDate: string): Promise<RecentBar[]> {
    const cached = await this.cache.recentBars.get();
    if (cached && cached.earliestDate <= sinceDate) {
      return cached.bars.filter((b) => b.trade_date >= sinceDate);
    }
    const fresh = await this.db.getRecentBars(sinceDate);
    const watermarks: Record<string, string> = {};
    for (const bar of fresh) {
      const cur = watermarks[bar.code];
      if (!cur || bar.trade_date > cur) watermarks[bar.code] = bar.trade_date;
    }
    await this.cache.recentBars.set({ earliestDate: sinceDate, bars: fresh, watermarks });
    return fresh;
  }

  // ── write-through ───────────────────────────────────────────────────────────
  async upsertBars(bars: DailyBarRecord[]): Promise<void> {
    await this.db.upsertBars(bars);
    const recentBars: RecentBar[] = bars.map((b) => ({
      code: b.code,
      trade_date: b.trade_date,
      close: b.close,
    }));
    const watermarks: Record<string, string> = {};
    for (const bar of bars) {
      const cur = watermarks[bar.code];
      if (!cur || bar.trade_date > cur) watermarks[bar.code] = bar.trade_date;
    }
    await this.cache.recentBars.append(recentBars, watermarks);
  }
}

/** Wrap an EquityDb instance with a transparent cache layer. */
export function withCache(db: IEquityDb, cache: CacheLayer): IEquityDb {
  return new CachedEquityDb(db, cache);
}

/** Singleton flat-file cache for dev and prod (until Redis is introduced). */
export const defaultCache: CacheLayer = new FlatCacheLayer();
