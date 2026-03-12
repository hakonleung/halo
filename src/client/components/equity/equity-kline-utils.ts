import type { EquityDailyBar, EquityDailyBarWithMA } from '@/client/types/equity-client';

export interface ChartBar extends EquityDailyBarWithMA {
  wickRange: [number, number];
}

export function calcMA(bars: EquityDailyBar[], period: number): (number | null)[] {
  return bars.map((_, i) => {
    if (i < period - 1) return null;
    const slice = bars.slice(i - period + 1, i + 1);
    return slice.reduce((s, b) => s + b.close, 0) / period;
  });
}

export function enrichBars(bars: EquityDailyBar[]): ChartBar[] {
  const ma5 = calcMA(bars, 5);
  const ma10 = calcMA(bars, 10);
  const ma20 = calcMA(bars, 20);
  return bars.map((b, i) => ({
    ...b,
    ma5: ma5[i],
    ma10: ma10[i],
    ma20: ma20[i],
    wickRange: [b.low, b.high] satisfies [number, number],
  }));
}
