'use client';

import { Box, HStack, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Customized,
} from 'recharts';

import type {
  EquityDailyBar,
  EquityDailyBarWithMA,
  EquityRange,
} from '@/client/types/equity-client';

// ── MA calculation ─────────────────────────────────────────────────────────

function calcMA(bars: EquityDailyBar[], period: number): (number | null)[] {
  return bars.map((_, i) => {
    if (i < period - 1) return null;
    const slice = bars.slice(i - period + 1, i + 1);
    return slice.reduce((s, b) => s + b.close, 0) / period;
  });
}

function enrichBars(bars: EquityDailyBar[]): EquityDailyBarWithMA[] {
  const ma5 = calcMA(bars, 5);
  const ma10 = calcMA(bars, 10);
  const ma20 = calcMA(bars, 20);
  return bars.map((b, i) => ({ ...b, ma5: ma5[i], ma10: ma10[i], ma20: ma20[i] }));
}

function filterByRange(bars: EquityDailyBarWithMA[], range: EquityRange): EquityDailyBarWithMA[] {
  const days = range === '1M' ? 30 : range === '3M' ? 90 : range === '6M' ? 180 : 365;
  return bars.slice(-days);
}

// ── Candlestick custom layer ───────────────────────────────────────────────

interface ChartInternals {
  xAxisMap?: Record<
    string,
    {
      scale: ((v: string) => number | undefined) & { bandwidth?: () => number };
    }
  >;
  yAxisMap?: Record<string, { scale: (v: number) => number }>;
  data?: EquityDailyBarWithMA[];
}

const CandlestickLayer = (props: ChartInternals) => {
  const { xAxisMap, yAxisMap, data } = props;
  if (!xAxisMap || !yAxisMap || !data) return null;

  const xAxis = xAxisMap['0'];
  const yAxis = yAxisMap['0'];
  if (!xAxis?.scale || !yAxis?.scale) return null;

  const bandwidth = xAxis.scale.bandwidth?.() ?? 6;
  const candleWidth = Math.max(bandwidth * 0.7, 2);

  return (
    <g>
      {data.map((d) => {
        const cx = (xAxis.scale(d.trade_date) ?? 0) + bandwidth / 2;
        const isGain = d.close >= d.open;
        const upColor = '#00FF41';
        const downColor = '#FF4444';
        const color = isGain ? upColor : downColor;

        const yHigh = yAxis.scale(d.high);
        const yLow = yAxis.scale(d.low);
        const yOpen = yAxis.scale(d.open);
        const yClose = yAxis.scale(d.close);

        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1);

        return (
          <g key={d.trade_date}>
            {/* Upper wick */}
            <line x1={cx} y1={yHigh} x2={cx} y2={bodyTop} stroke={color} strokeWidth={1} />
            {/* Body */}
            <rect
              x={cx - candleWidth / 2}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              fill={isGain ? 'transparent' : color}
              stroke={color}
              strokeWidth={1}
            />
            {/* Lower wick */}
            <line
              x1={cx}
              y1={bodyTop + bodyHeight}
              x2={cx}
              y2={yLow}
              stroke={color}
              strokeWidth={1}
            />
          </g>
        );
      })}
    </g>
  );
};

// ── Custom tooltip ─────────────────────────────────────────────────────────

interface TooltipPayload {
  payload?: EquityDailyBarWithMA;
}

const KlineTooltip = ({ payload }: { payload?: TooltipPayload[] }) => {
  const d = payload?.[0]?.payload;
  if (!d) return null;

  const isGain = d.close >= d.open;
  const color = isGain ? '#00FF41' : '#FF4444';
  const fmt = (v: number | null) => (v != null ? v.toFixed(2) : '-');

  return (
    <Box bg="#1A1A1A" border="1px solid rgba(0,255,65,0.3)" p={3} borderRadius="4px" fontSize="xs">
      <Text color="gray.400" mb={1} fontFamily="mono">
        {d.trade_date}
      </Text>
      <HStack gap={4}>
        <Box>
          <Text color="gray.500">开</Text>
          <Text color={color}>{fmt(d.open)}</Text>
        </Box>
        <Box>
          <Text color="gray.500">高</Text>
          <Text color={color}>{fmt(d.high)}</Text>
        </Box>
        <Box>
          <Text color="gray.500">低</Text>
          <Text color={color}>{fmt(d.low)}</Text>
        </Box>
        <Box>
          <Text color="gray.500">收</Text>
          <Text color={color}>{fmt(d.close)}</Text>
        </Box>
      </HStack>
      <HStack gap={4} mt={1}>
        <Box>
          <Text color="gray.500">涨跌</Text>
          <Text color={color}>{d.change_pct != null ? `${d.change_pct.toFixed(2)}%` : '-'}</Text>
        </Box>
        <Box>
          <Text color="gray.500">换手</Text>
          <Text color="white">
            {d.turnover_rate != null ? `${d.turnover_rate.toFixed(2)}%` : '-'}
          </Text>
        </Box>
        <Box>
          <Text color="gray.500">量(手)</Text>
          <Text color="white">{d.volume.toLocaleString()}</Text>
        </Box>
      </HStack>
    </Box>
  );
};

// ── Volume bar color ───────────────────────────────────────────────────────

const VolumeBar = (props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  close?: number;
  open?: number;
}) => {
  const { x = 0, y = 0, width = 0, height = 0, close = 0, open = 0 } = props;
  const fill = close >= open ? 'rgba(0,255,65,0.6)' : 'rgba(255,68,68,0.6)';
  return <rect x={x} y={y} width={width} height={height} fill={fill} />;
};

// ── Range selector ─────────────────────────────────────────────────────────

const RANGES: EquityRange[] = ['1M', '3M', '6M', '1Y'];

// ── Main chart component ───────────────────────────────────────────────────

interface Props {
  bars: EquityDailyBar[];
  range: EquityRange;
  onRangeChange: (r: EquityRange) => void;
}

export function EquityKlineChart({ bars, range, onRangeChange }: Props) {
  const enriched = useMemo(() => enrichBars(bars), [bars]);
  const visible = useMemo(() => filterByRange(enriched, range), [enriched, range]);

  const priceMin = useMemo(() => Math.min(...visible.map((d) => d.low)) * 0.995, [visible]);
  const priceMax = useMemo(() => Math.max(...visible.map((d) => d.high)) * 1.005, [visible]);

  // X-axis: show ~6 evenly-spaced labels
  const xTicks = useMemo(() => {
    if (visible.length === 0) return [];
    const step = Math.max(1, Math.floor(visible.length / 6));
    return visible
      .filter((_, i) => i % step === 0 || i === visible.length - 1)
      .map((d) => d.trade_date);
  }, [visible]);

  return (
    <Box>
      {/* Range selector */}
      <HStack gap={2} mb={3} justify="flex-end">
        {RANGES.map((r) => (
          <Box
            key={r}
            px={3}
            py={1}
            cursor="pointer"
            borderRadius="4px"
            border="1px solid"
            borderColor={range === r ? 'brand.matrix' : 'whiteAlpha.200'}
            color={range === r ? 'brand.matrix' : 'text.mist'}
            fontSize="xs"
            fontFamily="mono"
            onClick={() => onRangeChange(r)}
            _hover={{ borderColor: 'brand.matrix', color: 'brand.matrix' }}
            transition="all 0.15s"
          >
            {r}
          </Box>
        ))}
      </HStack>

      {/* Price + MA chart */}
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={visible} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="trade_date"
            ticks={xTicks}
            tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            domain={[priceMin, priceMax]}
            tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            width={55}
            tickFormatter={(v: number) => v.toFixed(2)}
          />
          <Tooltip content={<KlineTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
            formatter={(value) => <span style={{ color: '#888' }}>{value}</span>}
          />

          {/* Invisible bar to anchor band scale for candlestick positioning */}
          <Bar dataKey="close" fill="transparent" isAnimationActive={false} legendType="none" />

          {/* Candlestick layer */}
          {/* eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any */}
          <Customized component={CandlestickLayer as any} />

          <Line
            dataKey="ma5"
            dot={false}
            stroke="#FFD700"
            strokeWidth={1}
            name="MA5"
            isAnimationActive={false}
          />
          <Line
            dataKey="ma10"
            dot={false}
            stroke="#FF6B35"
            strokeWidth={1}
            name="MA10"
            isAnimationActive={false}
          />
          <Line
            dataKey="ma20"
            dot={false}
            stroke="#00D4FF"
            strokeWidth={1}
            name="MA20"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Volume + turnover chart */}
      <ResponsiveContainer width="100%" height={120}>
        <ComposedChart data={visible} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="trade_date"
            ticks={xTicks}
            tick={{ fill: '#888', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="vol"
            tick={{ fill: '#888', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            width={55}
            tickFormatter={(v: number) =>
              v >= 1_000_000
                ? `${(v / 1_000_000).toFixed(0)}M`
                : v >= 1_000
                  ? `${(v / 1_000).toFixed(0)}K`
                  : String(v)
            }
          />
          <YAxis
            yAxisId="tr"
            orientation="right"
            tick={{ fill: '#00D4FF', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
          />
          <Tooltip
            content={({ payload }) => {
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              const d = payload?.[0]?.payload as EquityDailyBarWithMA | undefined;
              if (!d) return null;
              return (
                <Box
                  bg="#1A1A1A"
                  border="1px solid rgba(0,255,65,0.3)"
                  p={2}
                  borderRadius="4px"
                  fontSize="xs"
                >
                  <Text color="gray.400" fontFamily="mono">
                    {d.trade_date}
                  </Text>
                  <Text color="white">量: {d.volume.toLocaleString()} 手</Text>
                  {d.turnover_rate != null && (
                    <Text color="#00D4FF">换手: {d.turnover_rate.toFixed(2)}%</Text>
                  )}
                </Box>
              );
            }}
          />
          <Bar
            yAxisId="vol"
            dataKey="volume"
            shape={<VolumeBar />}
            isAnimationActive={false}
            name="成交量"
          />
          <Line
            yAxisId="tr"
            dataKey="turnover_rate"
            dot={false}
            stroke="#00D4FF"
            strokeWidth={1}
            name="换手率"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
}
