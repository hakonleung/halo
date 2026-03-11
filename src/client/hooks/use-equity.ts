'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { internalApiService } from '@/client/internal-api';

import type { EquitySearchResult } from '@/client/types/equity-client';

const STOCKS_KEY = ['equity', 'stocks'] as const;
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
  return useMutation({
    mutationFn: () => internalApiService.syncEquity(),
    onSuccess: (_data, _vars) => {
      void qc.invalidateQueries({ queryKey: ['equity'] });
    },
  });
}

export function useSearchEquity(q: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['equity', 'search', q],
    queryFn: () => internalApiService.searchEquityStocks(q),
    enabled: q.trim().length > 0,
    staleTime: 30_000,
  });
  return { results: data ?? [], isLoading };
}
