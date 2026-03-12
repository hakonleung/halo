// Types
export type {
  EquityStock,
  EquityDailyBar,
  EquityDailyBarWithMA,
  EquitySearchResult,
  EquitySyncResult,
  EquityRange,
  EquityStockSummary,
  SortKey,
  PctPeriod,
  SortDir,
  MarketFilter,
  EquityFilter,
  PatternMatch,
  FindSimilarRequest,
  SyncEvent,
} from './types';
export { DEFAULT_EQUITY_FILTER } from './types';

// Components
export {
  EquityKlineChart,
  EquityKlineMini,
  StockSearchBar,
  EquitySparkline,
  EquityList,
  EquityDrawer,
  SimilarPatternsPanel,
  EquityMatchCard,
} from './components';
export type { KlineMode } from './components';

// Hooks
export {
  useEquityStocks,
  useEquityDailyBars,
  useAddEquityStock,
  useDeleteEquityStock,
  useSyncEquity,
  useEquitySummary,
  usePatternSimilarity,
  useSearchEquity,
} from './hooks';

// Store
export { useEquityStore } from './store';

// Strategies
export type { PatternStrategy } from './strategies';
export { strategyRegistry } from './strategies';
