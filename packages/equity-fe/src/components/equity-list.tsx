'use client';

import { Box, HStack, Text } from '@chakra-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useMemo, useState } from 'react';

import { DEFAULT_EQUITY_FILTER } from '../types';

import { EquityFilterBar } from './equity-filter-bar';
import { EquitySparkline } from './equity-sparkline';

import type { EquityFilter, EquityStockSummary, PctPeriod, SortDir, SortKey } from '../types';

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

function pctByPeriod(s: EquityStockSummary, period: PctPeriod): number | null {
  const map: Record<PctPeriod, number | null> = {
    change_1d: s.change_pct_1d,
    change_5d: s.change_pct_5d,
    change_10d: s.change_pct_10d,
    change_20d: s.change_pct_20d,
    change_50d: s.change_pct_50d,
    change_120d: s.change_pct_120d,
  };
  return map[period];
}

function marketFromCode(code: string): 'SH' | 'SZ' | 'BJ' {
  if (code.startsWith('6')) return 'SH';
  if (code.startsWith('9')) return 'BJ';
  return 'SZ';
}

function applyFilter(stocks: EquityStockSummary[], f: EquityFilter): EquityStockSummary[] {
  const pctMin = f.pctMin !== '' ? parseFloat(f.pctMin) : null;
  const pctMax = f.pctMax !== '' ? parseFloat(f.pctMax) : null;
  const trMin = f.turnoverMin !== '' ? parseFloat(f.turnoverMin) : null;
  const trMax = f.turnoverMax !== '' ? parseFloat(f.turnoverMax) : null;

  return stocks.filter((s) => {
    if (f.market !== 'ALL' && marketFromCode(s.code) !== f.market) return false;
    if (f.excludeST && /st/i.test(s.name)) return false;
    const pct = pctByPeriod(s, f.pctPeriod);
    if (pctMin !== null && (pct === null || pct < pctMin)) return false;
    if (pctMax !== null && (pct === null || pct > pctMax)) return false;
    if (trMin !== null && (s.turnover_rate === null || s.turnover_rate < trMin)) return false;
    if (trMax !== null && (s.turnover_rate === null || s.turnover_rate > trMax)) return false;
    return true;
  });
}

function sortValue(s: EquityStockSummary, key: SortKey): number {
  const map: Record<SortKey, number | null> = {
    change_1d: s.change_pct_1d,
    change_5d: s.change_pct_5d,
    change_10d: s.change_pct_10d,
    change_20d: s.change_pct_20d,
    change_50d: s.change_pct_50d,
    change_120d: s.change_pct_120d,
    turnover: s.turnover_rate,
  };
  return map[key] ?? -Infinity;
}

// ── column config ──────────────────────────────────────────────────────────

const SORT_COLS: { key: SortKey; label: string }[] = [
  { key: 'change_1d', label: '今日' },
  { key: 'turnover', label: '换手率' },
  { key: 'change_5d', label: '5日' },
  { key: 'change_10d', label: '10日' },
  { key: 'change_20d', label: '20日' },
  { key: 'change_50d', label: '50日' },
  { key: 'change_120d', label: '120日' },
];

const ROW_H = 36;

// ── components ─────────────────────────────────────────────────────────────

interface RowProps {
  index: number;
  stock: EquityStockSummary;
  selected: boolean;
  sortKey: SortKey;
  onClick: () => void;
}

function StockRow({ index, stock: s, selected, sortKey, onClick }: RowProps) {
  const bg = selected ? 'rgba(0,255,65,0.08)' : 'transparent';
  const border = selected ? 'rgba(0,255,65,0.4)' : 'transparent';

  return (
    <HStack
      h={`${ROW_H}px`}
      px={3}
      gap={0}
      w="100%"
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
      {/* Index */}
      <Text w="36px" color="#444" flexShrink={0} textAlign="right" pr={3}>
        {index + 1}
      </Text>
      {/* Code */}
      <Text w="68px" flexShrink={0} color="brand.matrix">
        {s.code}
      </Text>
      {/* Name */}
      <Text w="110px" flexShrink={0} color="text.fog" overflow="hidden" whiteSpace="nowrap" pr={2}>
        {s.name}
      </Text>
      {/* Sortable cols */}
      {SORT_COLS.map(({ key }) => {
        const isActive = key === sortKey;
        if (key === 'turnover') {
          return (
            <Text
              key={key}
              flex="1"
              minW="68px"
              maxW="90px"
              textAlign="right"
              color={isActive ? 'brand.matrix' : '#888'}
              fontWeight={isActive ? 'bold' : 'normal'}
            >
              {s.turnover_rate != null ? `${s.turnover_rate.toFixed(2)}%` : '-'}
            </Text>
          );
        }
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
                    : s.change_pct_120d;
        return (
          <Text
            key={key}
            flex="1"
            minW="68px"
            maxW="90px"
            textAlign="right"
            color={pctColor(val)}
            fontWeight={isActive ? 'bold' : 'normal'}
            opacity={isActive ? 1 : 0.75}
          >
            {fmtPct(val)}
          </Text>
        );
      })}
      {/* Sparkline */}
      <Box w="130px" flexShrink={0} display="flex" justifyContent="flex-end">
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
      w="100%"
      borderBottom="1px solid rgba(0,255,65,0.15)"
      fontSize="11px"
      fontFamily="mono"
      flexShrink={0}
      position="sticky"
      top={0}
      bg="#0F0F0F"
      zIndex={1}
    >
      <Text w="36px" color="#555" flexShrink={0} textAlign="right" pr={3}>
        #
      </Text>
      <Text w="68px" flexShrink={0} color="#555">
        代码
      </Text>
      <Text w="110px" flexShrink={0} color="#555">
        名称
      </Text>
      {SORT_COLS.map(({ key, label }) => (
        <Text
          key={key}
          flex="1"
          minW="68px"
          maxW="90px"
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
      <Text w="130px" flexShrink={0} textAlign="right" color="#555">
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
  const [filter, setFilter] = useState<EquityFilter>(DEFAULT_EQUITY_FILTER);

  const sorted = useMemo(() => {
    const filtered = applyFilter(stocks, filter);
    return filtered.sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      return sortDir === 'desc' ? bv - av : av - bv;
    });
  }, [stocks, sortKey, sortDir, filter]);

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
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return (
    <Box
      h="100%"
      bg="#0F0F0F"
      border="1px solid rgba(0,255,65,0.15)"
      borderRadius="4px"
      display="flex"
      flexDir="column"
      overflow="hidden"
    >
      <EquityFilterBar
        filter={filter}
        onChange={(f) => {
          setFilter(f);
          scrollRef.current?.scrollTo({ top: 0 });
        }}
      />
      <Box
        ref={scrollRef}
        flex="1"
        overflowY="auto"
        minH="0"
        css={{
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(0,255,65,0.2)', borderRadius: '2px' },
        }}
      >
        <HeaderRow sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
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
                  index={vi.index}
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
