'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { equityApi } from '../api';
import { useEquityStore } from '../store';

import type { FindSimilarRequest, PatternMatch, ScanMatch, SyncEvent } from '../types';
import { StrategyType } from '../types';

const STOCKS_KEY = ['equity', 'stocks'] as const;
const SUMMARY_KEY = ['equity', 'summary'] as const;
const dailyKey = (code: string) => ['equity', 'daily', code] as const;

export function useEquityStocks() {
  const { data, isLoading, error } = useQuery({
    queryKey: STOCKS_KEY,
    queryFn: () => equityApi.getStocks(),
  });
  return { stocks: data ?? [], isLoading, error };
}

export function useEquityDailyBars(code: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: dailyKey(code ?? ''),
    queryFn: () => equityApi.getDailyBars(code ?? '', 365),
    enabled: !!code,
  });
  return { bars: data ?? [], isLoading, error };
}

export function useDeleteEquityStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => equityApi.deleteStock(code),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STOCKS_KEY });
    },
  });
}

export function useSyncEquity() {
  const qc = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [lastEvent, setLastEvent] = useState<SyncEvent | null>(null);
  const [progressCount, setProgressCount] = useState<{ index: number; total: number } | null>(null);
  const [resumeFrom, setResumeFrom] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const startSync = useCallback(
    async (offset = 0) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setSyncing(true);
      setLastEvent(null);
      setProgressCount(null);
      setResumeFrom(null);

      try {
        await equityApi.streamSync(
          offset > 0 ? { offset } : {},
          (raw) => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const event = raw as unknown as SyncEvent;
            setLastEvent(event);
            if (event.type === 'progress') {
              setProgressCount({ index: event.index, total: event.total });
            }
            if (event.type === 'error') {
              setResumeFrom(event.resume_from);
            }
            if (event.type === 'done') {
              void qc.invalidateQueries({ queryKey: ['equity'] });
            }
          },
          ac.signal,
        );
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        if ((err as Error).name !== 'AbortError') {
          console.error('[useSyncEquity]', err);
        }
      } finally {
        setSyncing(false);
      }
    },
    [qc],
  );

  return { startSync, syncing, lastEvent, progressCount, resumeFrom };
}

/**
 * Returns the start-of-day timestamp of the most recent trading day (weekdays only).
 * Sat → Fri, Sun → Fri, Mon–Fri → today.
 */
function getLastTradingDayStart(): number {
  const d = new Date();
  const dow = d.getDay(); // 0=Sun, 6=Sat
  if (dow === 0) d.setDate(d.getDate() - 2);
  else if (dow === 6) d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function useEquitySummary() {
  const { stocks: cached, updatedAt, setStocks } = useEquityStore();
  const cacheIsFresh =
    updatedAt !== null && cached.length > 0 && updatedAt >= getLastTradingDayStart();

  const { data, isLoading, error } = useQuery({
    queryKey: SUMMARY_KEY,
    queryFn: () => equityApi.getSummary(),
    enabled: !cacheIsFresh,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data && data.length > 0) setStocks(data);
  }, [data, setStocks]);

  return { stocks: data ?? cached, isLoading: isLoading && cached.length === 0, error };
}

export function usePatternSimilarity() {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [matches, setMatches] = useState<PatternMatch[]>([]);
  const [scanMatches, setScanMatches] = useState<ScanMatch[]>([]);
  const [activeStrategy, setActiveStrategy] = useState<StrategyType>(StrategyType.FindSimilar);
  const abortRef = useRef<AbortController | null>(null);

  const findSimilar = useCallback(async (req: FindSimilarRequest) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setStatusMsg('');
    setMatches([]);
    setScanMatches([]);
    setActiveStrategy(req.strategy);

    const isSimilar = req.strategy === StrategyType.FindSimilar;

    try {
      await equityApi.streamSimilar(
        req,
        (event) => {
          if (event.type === 'status' && typeof event.message === 'string') {
            setStatusMsg(event.message);
          } else if (event.type === 'match') {
            if (isSimilar) {
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              const m = event as unknown as PatternMatch;
              setMatches((prev) => {
                const next = [...prev, m];
                next.sort((a, b) => b.similarity - a.similarity);
                return next;
              });
            } else {
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              setScanMatches((prev) => [...prev, event as unknown as ScanMatch]);
            }
          } else if (event.type === 'done') {
            setStatusMsg('');
          }
        },
        ac.signal,
      );
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      if ((err as Error).name !== 'AbortError') {
        console.error('[usePatternSimilarity]', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { findSimilar, loading, statusMsg, matches, scanMatches, activeStrategy };
}

export function useSearchEquity(q: string) {
  const [debounced, setDebounced] = useState(q);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q), 300);
    return () => clearTimeout(id);
  }, [q]);

  const { data, isLoading } = useQuery({
    queryKey: ['equity', 'search', debounced],
    queryFn: () => equityApi.searchStocks(debounced),
    enabled: debounced.trim().length > 0,
    staleTime: 60_000,
  });
  return { results: data ?? [], isLoading };
}
