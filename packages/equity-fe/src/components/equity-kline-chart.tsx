'use client';

import { Box, HStack, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import type { EquityDailyBar, EquityRange } from '../types';
import { KlineInfoPanel } from './equity-kline-info-panel';
import { CandlestickShape, VolumeBar } from './equity-kline-shapes';
import { enrichBars } from './equity-kline-utils';
import { useKlineInteraction } from './use-kline-interaction';

const RANGES: EquityRange[] = ['1M', '3M', '6M', '1Y'];
const RANGE_DAYS: Record<EquityRange, number> = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };

// Matches the 360px price chart margin.top
const PLOT_TOP = 4;

export type KlineMode = 'view' | 'select' | 'highlight';

export interface EquityKlineChartProps {
  bars: EquityDailyBar[];
  range: EquityRange;
  onRangeChange: (r: EquityRange) => void;
  mode?: KlineMode;
  onSelectRange?: (start: string, end: string) => void;
  highlightStart?: string | null;
  highlightEnd?: string | null;
}

function fmtVol(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

export function EquityKlineChart({
  bars,
  range,
  onRangeChange,
  mode = 'view',
  onSelectRange,
  highlightStart,
  highlightEnd,
}: EquityKlineChartProps) {
  const enriched = useMemo(() => enrichBars(bars), [bars]);
  const visible = useMemo(() => enriched.slice(-RANGE_DAYS[range]), [enriched, range]);

  const priceMin = useMemo(() => Math.min(...visible.map((d) => d.low)) * 0.995, [visible]);
  const priceMax = useMemo(() => Math.max(...visible.map((d) => d.high)) * 1.005, [visible]);
  const xTicks = useMemo(() => {
    if (!visible.length) return [];
    const step = Math.max(1, Math.floor(visible.length / 6));
    return visible
      .filter((_, i) => i % step === 0 || i === visible.length - 1)
      .map((d) => d.trade_date);
  }, [visible]);

  const latestClose = visible[visible.length - 1]?.close ?? null;

  const {
    hoveredBar,
    hoveredIndex,
    selRange,
    crosshairHLineRef,
    crosshairVLineRef,
    crosshairLabelRef,
    crosshairPriceTextRef,
    handleContainerMouseDown,
    handleContainerMouseUp,
    handleContainerMouseLeave,
    handleContainerMouseMove,
  } = useKlineInteraction({ visible, priceMin, priceMax, mode, onSelectRange });

  const tradingDaysToLatest =
    hoveredIndex != null ? visible.length - 1 - hoveredIndex : null;

  const activeHighlight =
    mode === 'select'
      ? selRange
      : mode === 'highlight' && highlightStart && highlightEnd
        ? ([highlightStart, highlightEnd] as [string, string])
        : null;

  return (
    <Box>
      {/* Select mode hint */}
      {mode === 'select' && (
        <Box mb={2} px={3} py={1.5} bg="rgba(0,212,255,0.05)"
          border="1px solid rgba(0,212,255,0.2)" borderRadius="4px">
          <Text fontFamily="mono" fontSize="xs" color="#00D4FF">
            {selRange
              ? `已选区间：${selRange[0]} → ${selRange[1]}，松开鼠标确认`
              : '在K线图上按住并拖拽选择区间'}
          </Text>
        </Box>
      )}

      {/* Range selector */}
      <HStack gap={2} mb={2} justify="flex-end">
        {RANGES.map((r) => (
          <Box key={r} px={3} py={1} cursor="pointer" borderRadius="4px" border="1px solid"
            borderColor={range === r ? 'brand.matrix' : 'whiteAlpha.200'}
            color={range === r ? 'brand.matrix' : 'text.mist'} fontSize="xs" fontFamily="mono"
            onClick={() => onRangeChange(r)}
            _hover={{ borderColor: 'brand.matrix', color: 'brand.matrix' }}
            transition="all 0.15s">
            {r}
          </Box>
        ))}
      </HStack>

      {/* Hover info panel */}
      <KlineInfoPanel
        hoveredBar={hoveredBar}
        latestClose={latestClose}
        tradingDaysToLatest={tradingDaysToLatest}
      />

      {/* Price chart — no onMouseMove on ComposedChart to avoid Recharts internal setState */}
      <Box position="relative"
        onMouseDown={handleContainerMouseDown}
        onMouseUp={handleContainerMouseUp}
        onMouseLeave={handleContainerMouseLeave}
        onMouseMove={handleContainerMouseMove}
        style={mode === 'select' ? { cursor: 'crosshair', userSelect: 'none' } : {}}>

        {/* Horizontal crosshair line */}
        <div ref={crosshairHLineRef} style={{
          display: 'none',
          position: 'absolute',
          left: '55px',
          right: '8px',
          top: 0,
          height: 0,
          borderTop: '1px dashed rgba(255,255,255,0.22)',
          zIndex: 9,
          pointerEvents: 'none',
        }} />
        {/* Vertical crosshair line */}
        <div ref={crosshairVLineRef} style={{
          display: 'none',
          position: 'absolute',
          top: `${PLOT_TOP}px`,
          bottom: '30px', // approximate XAxis height
          width: 0,
          borderLeft: '1px dashed rgba(255,255,255,0.22)',
          zIndex: 9,
          pointerEvents: 'none',
        }} />
        {/* Price label on y-axis */}
        <div ref={crosshairLabelRef} style={{
          display: 'none',
          position: 'absolute',
          left: '1px',
          top: 0,
          zIndex: 9,
          pointerEvents: 'none',
          width: '53px',
          height: '16px',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '4px',
          background: 'rgba(18,18,18,0.95)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '2px',
        }}>
          <span ref={crosshairPriceTextRef} style={{
            fontFamily: 'monospace', fontSize: '9px', color: '#ddd', lineHeight: '1',
          }} />
        </div>

        <ResponsiveContainer width="100%" height={360}>
          {/* No onMouseMove — Recharts never updates internal state on hover → no SVG re-render */}
          <ComposedChart data={visible} margin={{ top: PLOT_TOP, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="trade_date" ticks={xTicks}
              tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
            <YAxis domain={[priceMin, priceMax]}
              tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false} tickLine={false} width={55}
              tickFormatter={(v: number) => v.toFixed(2)} />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
              formatter={(value) => <span style={{ color: '#888' }}>{value}</span>} />
            {/* eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any */}
            <Bar dataKey="wickRange" shape={(<CandlestickShape />) as any}
              isAnimationActive={false} legendType="none" />
            <Line dataKey="ma5" dot={false} stroke="rgba(255,215,0,0.55)" strokeWidth={1}
              name="MA5" isAnimationActive={false} />
            <Line dataKey="ma10" dot={false} stroke="rgba(255,107,53,0.55)" strokeWidth={1}
              name="MA10" isAnimationActive={false} />
            <Line dataKey="ma20" dot={false} stroke="rgba(0,212,255,0.55)" strokeWidth={1}
              name="MA20" isAnimationActive={false} />
            {activeHighlight && (
              <ReferenceArea x1={activeHighlight[0]} x2={activeHighlight[1]}
                fill="rgba(0,212,255,0.12)" stroke="rgba(0,212,255,0.5)" strokeOpacity={1} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </Box>

      {/* Volume chart */}
      <ResponsiveContainer width="100%" height={120}>
        <ComposedChart data={visible} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="trade_date" ticks={xTicks}
            tick={{ fill: '#888', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
          <YAxis yAxisId="vol" tick={{ fill: '#888', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={false} tickLine={false} width={55} tickFormatter={fmtVol} />
          <YAxis yAxisId="tr" orientation="right"
            tick={{ fill: '#00D4FF', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={false} tickLine={false} width={40}
            tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
          <Bar yAxisId="vol" dataKey="volume" shape={<VolumeBar />}
            isAnimationActive={false} name="成交量" />
          <Line yAxisId="tr" dataKey="turnover_rate" dot={false} stroke="#00D4FF"
            strokeWidth={1} name="换手率" isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
}
