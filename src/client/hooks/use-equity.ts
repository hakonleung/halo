'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { internalApiService } from '@/client/internal-api';

import type { EquitySearchResult, SyncEvent } from '@/client/types/equity-client';

const STOCKS_KEY = ['equity', 'stocks'] as const;
const SUMMARY_KEY = ['equity', 'summary'] as const;
const dailyKey = (code: string) => ['equity', 'daily', code] as const;

export function useEquityStocks() {
  const { data, isLoading, error } = useQuery({
    queryKey: STOCKS_KEY,
    queryFn: () => internalApiService.getEquityStocks(),
  });
  return { stocks: data ?? [], isLoading, error };
}

export function useEquityDailyBars(code: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: dailyKey(code ?? ''),
    queryFn: () => internalApiService.getEquityDailyBars(code ?? '', 365),
    enabled: !!code,
  });
  return { bars: data ?? [], isLoading, error };
}

export function useAddEquityStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stock: EquitySearchResult) =>
      internalApiService.addEquityStock({
        code: stock.code,
        name: stock.name,
        market: stock.market,
        secid: stock.secid,
        industry: stock.industry,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STOCKS_KEY });
    },
  });
}

export function useDeleteEquityStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => internalApiService.deleteEquityStock(code),
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
        const res = await fetch('/api/equity/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(offset > 0 ? { offset } : {}),
          signal: ac.signal,
        });

        if (!res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const event: SyncEvent = JSON.parse(trimmed);
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
            } catch {
              // ignore malformed lines
            }
          }
        }
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

export function useEquitySummary() {
  const { data, isLoading, error } = useQuery({
    queryKey: SUMMARY_KEY,
    queryFn: () => internalApiService.getEquitySummary(),
    staleTime: 5 * 60_000,
  });
  return { stocks: data ?? [], isLoading, error };
}

export function useSearchEquity(q: string) {
  const [debounced, setDebounced] = useState(q);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q), 300);
    return () => clearTimeout(id);
  }, [q]);

  const { data, isLoading } = useQuery({
    queryKey: ['equity', 'search', debounced],
    queryFn: () => internalApiService.searchEquityStocks(debounced),
    enabled: debounced.trim().length > 0,
    staleTime: 60_000,
  });
  return { results: data ?? [], isLoading };
}
