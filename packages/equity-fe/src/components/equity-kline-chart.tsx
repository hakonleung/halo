'use client';

import { Box, HStack, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { EquityDailyBar, EquityRange } from '../types';
import { CandlestickShape, VolumeBar } from './equity-kline-shapes';
import { enrichBars } from './equity-kline-utils';
import type { ChartBar } from './equity-kline-utils';

const RANGES: EquityRange[] = ['1M', '3M', '6M', '1Y'];
const RANGE_DAYS: Record<EquityRange, number> = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };

// Chart layout constants for the 360px price chart
// margin.top=4; XAxis default height≈30px → plot area: y∈[4, 330], height=326
const PLOT_TOP = 4;
const PLOT_BOTTOM = 330;
const PLOT_HEIGHT = PLOT_BOTTOM - PLOT_TOP;

export type KlineMode = 'view' | 'select' | 'highlight';

interface Props {
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
}: Props) {
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

  // ── Hover state ───────────────────────────────────────────────────────────
  const [hoveredBar, setHoveredBar] = useState<ChartBar | null>(null);
  const [crosshairY, setCrosshairY] = useState<{ y: number; price: number } | null>(null);
  useEffect(() => { setHoveredBar(null); setCrosshairY(null); }, [bars]);

  const hoverFromToday =
    hoveredBar && latestClose
      ? ((latestClose - hoveredBar.close) / hoveredBar.close) * 100
      : null;

  // ── Drag selection ────────────────────────────────────────────────────────
  const isDraggingRef = useRef(false);
  const activeLabelRef = useRef<string | null>(null);
  const selStartRef = useRef<string | null>(null);
  const [selRange, setSelRange] = useState<[string, string] | null>(null);

  useEffect(() => {
    if (mode !== 'select') { setSelRange(null); isDraggingRef.current = false; }
  }, [mode]);

  const handleContainerMouseDown = () => {
    if (mode !== 'select' || !activeLabelRef.current) return;
    isDraggingRef.current = true;
    selStartRef.current = activeLabelRef.current;
    setSelRange([activeLabelRef.current, activeLabelRef.current]);
  };

  const handleContainerMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (selStartRef.current && activeLabelRef.current) {
      const sorted = [selStartRef.current, activeLabelRef.current].sort() as [string, string];
      setSelRange(null);
      selStartRef.current = null;
      onSelectRange?.(sorted[0], sorted[1]);
    }
  };

  const handleContainerMouseLeave = () => {
    handleContainerMouseUp();
    setHoveredBar(null);
    setCrosshairY(null);
  };

  // Track Y crosshair via native mouse event (reliable regardless of Recharts internals)
  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    if (y >= PLOT_TOP && y <= PLOT_BOTTOM) {
      const ratio = (y - PLOT_TOP) / PLOT_HEIGHT;
      setCrosshairY({ y, price: priceMax - ratio * (priceMax - priceMin) });
    } else {
      setCrosshairY(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChartMouseMove = (e: any) => {
    const label: unknown = e?.activeLabel;
    if (typeof label !== 'string') return;
    activeLabelRef.current = label;
    // Bar info lookup
    const bar = visible.find((b) => b.trade_date === label) ?? null;
    setHoveredBar(bar);
    // Drag selection
    if (mode === 'select' && isDraggingRef.current && selStartRef.current) {
      setSelRange([selStartRef.current, label].sort() as [string, string]);
    }
  };

  const activeHighlight =
    mode === 'select'
      ? selRange
      : mode === 'highlight' && highlightStart && highlightEnd
        ? ([highlightStart, highlightEnd] as [string, string])
        : null;

  // Clamped Y for the price label so it stays inside the plot area
  const labelY = crosshairY
    ? Math.max(PLOT_TOP, Math.min(PLOT_BOTTOM - 18, crosshairY.y - 9))
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
      <HStack gap={2} mb={3} justify="flex-end">
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

      {/* Price chart */}
      <Box position="relative"
        onMouseDown={handleContainerMouseDown}
        onMouseUp={handleContainerMouseUp}
        onMouseLeave={handleContainerMouseLeave}
        onMouseMove={handleContainerMouseMove}
        style={mode === 'select' ? { cursor: 'crosshair', userSelect: 'none' } : {}}>

        {/* Hover info — top-left (past y-axis) */}
        {hoveredBar && (
          <Box position="absolute" top="8px" left="64px" zIndex={10} pointerEvents="none"
            bg="rgba(10,10,10,0.88)" border="1px solid rgba(255,255,255,0.08)"
            borderRadius="4px" px={2} py={1.5} minW="200px">
            <HStack gap={3} mb={1}>
              <Text fontFamily="mono" fontSize="10px" color="#888">{hoveredBar.trade_date}</Text>
              {hoverFromToday !== null && (
                <Text fontFamily="mono" fontSize="10px" fontWeight="bold"
                  color={hoverFromToday >= 0 ? '#FF4444' : '#00FF41'}>
                  距今 {hoverFromToday >= 0 ? '+' : ''}{hoverFromToday.toFixed(2)}%
                </Text>
              )}
            </HStack>
            <HStack gap={3} mb={0.5}>
              {(['开', '高', '低', '收'] as const).map((lbl, idx) => {
                const val = [hoveredBar.open, hoveredBar.high, hoveredBar.low, hoveredBar.close][idx];
                const c = hoveredBar.close >= hoveredBar.open ? '#FF4444' : '#00FF41';
                return (
                  <Box key={lbl}>
                    <Text fontFamily="mono" fontSize="9px" color="#555">{lbl}</Text>
                    <Text fontFamily="mono" fontSize="10px" color={c}>{val.toFixed(2)}</Text>
                  </Box>
                );
              })}
            </HStack>
            <HStack gap={3}>
              <Box>
                <Text fontFamily="mono" fontSize="9px" color="#555">涨跌</Text>
                <Text fontFamily="mono" fontSize="10px"
                  color={hoveredBar.close >= hoveredBar.open ? '#FF4444' : '#00FF41'}>
                  {hoveredBar.change_pct != null
                    ? `${hoveredBar.change_pct >= 0 ? '+' : ''}${hoveredBar.change_pct.toFixed(2)}%`
                    : '-'}
                </Text>
              </Box>
              <Box>
                <Text fontFamily="mono" fontSize="9px" color="#555">换手</Text>
                <Text fontFamily="mono" fontSize="10px" color="#aaa">
                  {hoveredBar.turnover_rate != null
                    ? `${hoveredBar.turnover_rate.toFixed(2)}%` : '-'}
                </Text>
              </Box>
              <Box>
                <Text fontFamily="mono" fontSize="9px" color="#555">量</Text>
                <Text fontFamily="mono" fontSize="10px" color="#aaa">
                  {fmtVol(hoveredBar.volume)}
                </Text>
              </Box>
            </HStack>
          </Box>
        )}

        {/* Horizontal dashed line + Y-axis price label */}
        {crosshairY && labelY !== null && (
          <>
            {/* Horizontal dashed line via plain div — avoids Chakra h="0" quirks */}
            <div style={{
              position: 'absolute',
              left: '55px',
              right: '8px',
              top: `${crosshairY.y}px`,
              height: 0,
              borderTop: '1px dashed rgba(255,255,255,0.22)',
              zIndex: 9,
              pointerEvents: 'none',
            }} />
            {/* Price label over y-axis area */}
            <Box position="absolute" left="1px" top={`${labelY}px`} zIndex={9}
              pointerEvents="none" w="53px" h="16px"
              display="flex" alignItems="center" justifyContent="flex-end" pr="4px"
              bg="rgba(18,18,18,0.95)" border="1px solid rgba(255,255,255,0.18)"
              borderRadius="2px">
              <Text fontFamily="mono" fontSize="9px" color="#ddd" lineHeight="1">
                {crosshairY.price.toFixed(2)}
              </Text>
            </Box>
          </>
        )}

        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={visible} margin={{ top: PLOT_TOP, right: 8, bottom: 0, left: 0 }}
            onMouseMove={handleChartMouseMove}>
            {/* Vertical dashed cursor line — drawn by Recharts inside SVG */}
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.18)', strokeWidth: 1, strokeDasharray: '4 3' }}
              wrapperStyle={{ display: 'none' }}
            />
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
