'use client';

import { Box, HStack, Text } from '@chakra-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useMemo, useState } from 'react';

import { EquitySparkline } from './equity-sparkline';

import type { EquityStockSummary, SortDir, SortKey } from '@/client/types/equity-client';

// ── helpers ────────────────────────────────────────────────────────────────

function fmtPct(v: number | null): string {
  if (v == null) return '-';
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

function pctColor(v: number | null): string {
  if (v == null) return '#555';
  if (v > 0) return '#FF4444';
  if (v < 0) return '#00FF41';
  return '#888';
}

function sortValue(s: EquityStockSummary, key: SortKey): number {
  const map: Record<SortKey, number | null> = {
    change_1d: s.change_pct_1d,
    change_5d: s.change_pct_5d,
    change_10d: s.change_pct_10d,
    change_20d: s.change_pct_20d,
    change_50d: s.change_pct_50d,
    change_250d: s.change_pct_250d,
    turnover: s.turnover_rate,
  };
  return map[key] ?? -Infinity;
}

// ── column config ──────────────────────────────────────────────────────────

const SORT_COLS: { key: SortKey; label: string }[] = [
  { key: 'change_1d', label: '今日' },
  { key: 'change_5d', label: '5日' },
  { key: 'change_10d', label: '10日' },
  { key: 'change_20d', label: '20日' },
  { key: 'change_50d', label: '50日' },
  { key: 'change_250d', label: '250日' },
  { key: 'turnover', label: '换手率' },
];

const ROW_H = 36;

// ── components ─────────────────────────────────────────────────────────────

interface RowProps {
  stock: EquityStockSummary;
  selected: boolean;
  sortKey: SortKey;
  onClick: () => void;
}

function StockRow({ stock: s, selected, sortKey, onClick }: RowProps) {
  const bg = selected ? 'rgba(0,255,65,0.08)' : 'transparent';
  const border = selected ? 'rgba(0,255,65,0.4)' : 'transparent';

  return (
    <HStack
      h={`${ROW_H}px`}
      px={3}
      gap={0}
      bg={bg}
      borderLeft="2px solid"
      borderColor={border}
      cursor="pointer"
      onClick={onClick}
      _hover={{ bg: 'rgba(255,255,255,0.03)' }}
      transition="background 0.1s"
      fontSize="12px"
      fontFamily="mono"
      flexShrink={0}
    >
      {/* Code */}
      <Text w="60px" color="brand.matrix" flexShrink={0}>
        {s.code}
      </Text>
      {/* Name */}
      <Text w="96px" color="text.fog" flexShrink={0} overflow="hidden" whiteSpace="nowrap">
        {s.name}
      </Text>
      {/* Change cols */}
      {SORT_COLS.slice(0, 6).map(({ key }) => {
        const val =
          key === 'change_1d'
            ? s.change_pct_1d
            : key === 'change_5d'
              ? s.change_pct_5d
              : key === 'change_10d'
                ? s.change_pct_10d
                : key === 'change_20d'
                  ? s.change_pct_20d
                  : key === 'change_50d'
                    ? s.change_pct_50d
                    : s.change_pct_250d;
        const isActive = key === sortKey;
        return (
          <Text
            key={key}
            w="64px"
            flexShrink={0}
            textAlign="right"
            color={pctColor(val)}
            fontWeight={isActive ? 'bold' : 'normal'}
            opacity={isActive ? 1 : 0.75}
          >
            {key === 'turnover' ? '-' : fmtPct(val)}
          </Text>
        );
      })}
      {/* Turnover */}
      <Text
        w="64px"
        flexShrink={0}
        textAlign="right"
        color={sortKey === 'turnover' ? 'brand.matrix' : '#888'}
        fontWeight={sortKey === 'turnover' ? 'bold' : 'normal'}
      >
        {s.turnover_rate != null ? `${s.turnover_rate.toFixed(2)}%` : '-'}
      </Text>
      {/* Sparkline */}
      <Box w="88px" flexShrink={0} display="flex" justifyContent="flex-end">
        <EquitySparkline prices={s.sparkline} />
      </Box>
    </HStack>
  );
}

// ── header row ─────────────────────────────────────────────────────────────

interface HeaderProps {
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

function HeaderRow({ sortKey, sortDir, onSort }: HeaderProps) {
  return (
    <HStack
      h="32px"
      px={3}
      gap={0}
      borderBottom="1px solid rgba(0,255,65,0.15)"
      fontSize="11px"
      fontFamily="mono"
      flexShrink={0}
    >
      <Text w="60px" color="#555" flexShrink={0}>
        代码
      </Text>
      <Text w="96px" color="#555" flexShrink={0}>
        名称
      </Text>
      {SORT_COLS.slice(0, 6).map(({ key, label }) => (
        <Text
          key={key}
          w="64px"
          flexShrink={0}
          textAlign="right"
          cursor="pointer"
          color={sortKey === key ? 'brand.matrix' : '#555'}
          _hover={{ color: 'brand.matrix' }}
          onClick={() => onSort(key)}
          userSelect="none"
        >
          {label}
          {sortKey === key ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
        </Text>
      ))}
      <Text
        w="64px"
        flexShrink={0}
        textAlign="right"
        cursor="pointer"
        color={sortKey === 'turnover' ? 'brand.matrix' : '#555'}
        _hover={{ color: 'brand.matrix' }}
        onClick={() => onSort('turnover')}
        userSelect="none"
      >
        换手率{sortKey === 'turnover' ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
      </Text>
      <Text w="88px" flexShrink={0} textAlign="right" color="#555">
        近50日
      </Text>
    </HStack>
  );
}

// ── main export ────────────────────────────────────────────────────────────

interface Props {
  stocks: EquityStockSummary[];
  selectedCode: string | null;
  onSelect: (stock: EquityStockSummary, index: number, sorted: EquityStockSummary[]) => void;
}

export function EquityList({ stocks, selectedCode, onSelect }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('change_1d');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    return [...stocks].sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      return sortDir === 'desc' ? bv - av : av - bv;
    });
  }, [stocks, sortKey, sortDir]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_H,
    overscan: 10,
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <Box
      bg="#0F0F0F"
      border="1px solid rgba(0,255,65,0.15)"
      borderRadius="4px"
      display="flex"
      flexDir="column"
      overflow="hidden"
    >
      <HeaderRow sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
      <Box ref={scrollRef} flex="1" overflowY="auto" minH="0">
        <Box h={`${virtualizer.getTotalSize()}px`} position="relative">
          {virtualizer.getVirtualItems().map((vi) => {
            const s = sorted[vi.index];
            return (
              <Box
                key={vi.key}
                position="absolute"
                top={0}
                left={0}
                right={0}
                transform={`translateY(${vi.start}px)`}
              >
                <StockRow
                  stock={s}
                  selected={s.code === selectedCode}
                  sortKey={sortKey}
                  onClick={() => onSelect(s, vi.index, sorted)}
                />
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
