'use client';

import { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceArea,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import type { EquityDailyBar } from '@/client/types/equity-client';
import { CandlestickShape } from './equity-kline-shapes';
import { enrichBars } from './equity-kline-utils';

interface Props {
  bars: EquityDailyBar[];
  highlightStart: string;
  highlightEnd: string;
  similarity: number;
}

function simColor(s: number) {
  return s >= 0.9 ? '#00FF41' : s >= 0.7 ? '#00D4FF' : '#888';
}

export function EquityKlineMini({ bars, highlightStart, highlightEnd, similarity }: Props) {
  const enriched = useMemo(() => enrichBars(bars), [bars]);
  const priceMin = useMemo(
    () => (enriched.length ? Math.min(...enriched.map((d) => d.low)) * 0.995 : 0),
    [enriched],
  );
  const priceMax = useMemo(
    () => (enriched.length ? Math.max(...enriched.map((d) => d.high)) * 1.005 : 100),
    [enriched],
  );

  const xTicks = useMemo(() => {
    if (!enriched.length) return [];
    const step = Math.max(1, Math.floor(enriched.length / 4));
    return enriched.filter((_, i) => i % step === 0).map((d) => d.trade_date);
  }, [enriched]);

  if (!enriched.length) return null;

  return (
    <ResponsiveContainer width="100%" height={130}>
      <ComposedChart data={enriched} margin={{ top: 12, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
        <XAxis
          dataKey="trade_date"
          ticks={xTicks}
          tick={{ fill: '#555', fontSize: 9, fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[priceMin, priceMax]}
          tick={{ fill: '#555', fontSize: 9, fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
          width={45}
          tickFormatter={(v: number) => v.toFixed(2)}
        />
        {/* eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any */}
        <Bar dataKey="wickRange" shape={(<CandlestickShape />) as any}
          isAnimationActive={false} legendType="none" />
        <ReferenceArea
          x1={highlightStart}
          x2={highlightEnd}
          fill="rgba(0,212,255,0.12)"
          stroke="rgba(0,212,255,0.45)"
          strokeOpacity={1}
          label={{
            value: `${(similarity * 100).toFixed(1)}%`,
            position: 'insideTop',
            fill: simColor(similarity),
            fontSize: 10,
            fontFamily: 'monospace',
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
