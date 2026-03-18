import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EquityStockSummary } from '../types';

interface EquityStore {
  stocks: EquityStockSummary[];
  updatedAt: number | null;
  setStocks: (stocks: EquityStockSummary[]) => void;
}

export const useEquityStore = create<EquityStore>()(
  persist(
    (set) => ({
      stocks: [],
      updatedAt: null,
      setStocks: (stocks) => set({ stocks, updatedAt: Date.now() }),
    }),
    {
      name: 'equity-summary',
    },
  ),
);
