'use client';

import { Box, Flex, HStack, Text, Button, Spinner, Input } from '@chakra-ui/react';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';

import { withAuth } from '@/client/components/auth/with-auth';
import { AuthenticatedLayout } from '@/client/components/layout/authenticated-layout';

import { EquityList, EquityDrawer, useSyncEquity, useEquitySummary } from '@neo-log/equity-fe';

import type { EquityStockSummary, SyncEvent } from '@neo-log/equity-fe';

// ── Sync log ───────────────────────────────────────────────────────────────

function eventText(e: SyncEvent): string {
  if (e.type === 'status') return e.message;
  if (e.type === 'init_progress') return `初始化 ${e.batch}/${e.total_batches} 批次...`;
  if (e.type === 'init_done') return `✓ 已导入 ${e.total} 只股票`;
  if (e.type === 'progress') {
    if (e.error) return `❌ ${e.code} ${e.name}: ${e.error}`;
    if (e.inserted === 0) return `${e.code} ${e.name} skip`;
    return `${e.code} ${e.name} +${e.inserted} bars → ${e.latestDate ?? '-'}`;
  }
  if (e.type === 'error') return `❌ ${e.code}: ${e.message}`;
  if (e.type === 'done') return `✓ 同步完成，共 ${e.synced} 只`;
  return '';
}

function eventColor(e: SyncEvent): string {
  if (e.type === 'error') return 'red.400';
  if (e.type === 'progress' && e.error) return 'red.400';
  if (e.type === 'progress' && e.inserted === 0) return 'text.mist';
  return 'brand.matrix';
}

interface SyncLogProps {
  lastEvent: SyncEvent | null;
  progressCount: { index: number; total: number } | null;
}

function SyncLog({ lastEvent, progressCount }: SyncLogProps) {
  if (!lastEvent) return null;

  const pct =
    lastEvent.type === 'done'
      ? 100
      : progressCount && progressCount.total > 0
        ? Math.round((progressCount.index / progressCount.total) * 100)
        : null;

  const pctText =
    pct !== null
      ? `${pct}%${progressCount ? ` (${progressCount.index}/${progressCount.total})` : ''}`
      : null;

  return (
    <Box
      mt={3}
      px={3}
      py={2}
      bg="#0A0A0A"
      border="1px solid rgba(0,255,65,0.2)"
      borderRadius="4px"
      fontFamily="mono"
      fontSize="11px"
    >
      <Box h="2px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden" mb={2}>
        <Box h="100%" w={`${pct ?? 0}%`} bg="brand.matrix" transition="width 0.3s ease" />
      </Box>
      <Text color={eventColor(lastEvent)}>
        {pctText && (
          <Text as="span" color="brand.matrix" mr={2}>
            {pctText}
          </Text>
        )}
        {eventText(lastEvent)}
      </Text>
    </Box>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

function EquityPage() {
  const { stocks, isLoading: stocksLoading } = useEquitySummary();
  const { startSync, syncing, lastEvent, progressCount, resumeFrom } = useSyncEquity();

  // Drawer state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // sorted stocks come from EquityList; we need to track them to support arrow nav
  const [sortedStocks, setSortedStocks] = useState<EquityStockSummary[]>([]);

  const selectedStock = selectedIndex !== null ? (sortedStocks[selectedIndex] ?? null) : null;

  const handleSelect = useCallback(
    (_stock: EquityStockSummary, index: number, sorted: EquityStockSummary[]) => {
      setSortedStocks(sorted);
      setSelectedIndex(index);
      setDrawerOpen(true);
    },
    [],
  );

  const handlePrev = () => setSelectedIndex((i) => (i != null && i > 0 ? i - 1 : i));
  const handleNext = () =>
    setSelectedIndex((i) => (i != null && i < sortedStocks.length - 1 ? i + 1 : i));

  // Frontend search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 150);
    return () => clearTimeout(id);
  }, [searchQuery]);

  // Pre-build lowercase index once when stocks load (5000+ items)
  const searchIndex = useMemo(
    () => stocks.map((s) => ({ stock: s, nameLower: s.name.toLowerCase() })),
    [stocks],
  );

  const searchResults = useMemo(() => {
    if (!debouncedQuery) return [];
    const results: EquityStockSummary[] = [];
    for (const { stock, nameLower } of searchIndex) {
      if (stock.code.includes(debouncedQuery) || nameLower.includes(debouncedQuery)) {
        results.push(stock);
        if (results.length === 10) break;
      }
    }
    return results;
  }, [debouncedQuery, searchIndex]);

  const handleSearchSelect = useCallback(
    (stock: EquityStockSummary) => {
      setSearchQuery('');
      setSearchFocused(false);
      const idx = sortedStocks.findIndex((s) => s.code === stock.code);
      if (idx >= 0) {
        setSelectedIndex(idx);
      } else {
        setSortedStocks(stocks);
        setSelectedIndex(stocks.indexOf(stock));
      }
      setDrawerOpen(true);
    },
    [sortedStocks, stocks],
  );

  return (
    <AuthenticatedLayout>
      <Box
        px={{ base: 3, md: 6 }}
        py={4}
        maxW="1400px"
        mx="auto"
        h="calc(100vh - 64px)"
        display="flex"
        flexDir="column"
      >
        {/* Header */}
        <Flex align="center" justify="space-between" mb={3} wrap="wrap" gap={3} flexShrink={0}>
          <Text
            fontFamily="heading"
            fontSize="2xl"
            color="brand.matrix"
            textShadow="0 0 10px currentColor"
          >
            EQUITY
          </Text>
          <HStack gap={3}>
            {/* Frontend search */}
            <Box ref={searchRef} position="relative" w="180px">
              <Input
                size="sm"
                placeholder="搜索股票..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                fontFamily="mono"
                fontSize="xs"
                bg="#0A0A0A"
                borderColor="rgba(0,255,65,0.3)"
                color="#E0E0E0"
                _placeholder={{ color: '#555' }}
                _focus={{ borderColor: 'brand.matrix', boxShadow: '0 0 0 1px #00FF41' }}
              />
              {searchFocused && searchResults.length > 0 && (
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  mt="2px"
                  bg="#1A1A1A"
                  border="1px solid rgba(0,255,65,0.3)"
                  borderRadius="4px"
                  zIndex={1000}
                  maxH="240px"
                  overflowY="auto"
                >
                  {searchResults.map((s) => (
                    <Box
                      key={s.code}
                      px={3}
                      py="6px"
                      cursor="pointer"
                      _hover={{ bg: 'rgba(0,255,65,0.08)' }}
                      onMouseDown={() => handleSearchSelect(s)}
                    >
                      <Text fontFamily="mono" fontSize="xs" color="brand.matrix">
                        {s.code}
                      </Text>
                      <Text fontFamily="mono" fontSize="10px" color="#888">
                        {s.name}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            {resumeFrom !== null && !syncing ? (
              <Button
                size="sm"
                variant="outline"
                borderColor="red.400"
                color="red.400"
                fontFamily="mono"
                fontSize="xs"
                onClick={() => void startSync(resumeFrom)}
                _hover={{ bg: 'rgba(255,68,68,0.08)' }}
              >
                <RotateCcw size={14} />
                重试 (从第 {resumeFrom + 1} 只)
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                borderColor="brand.matrix"
                color="brand.matrix"
                fontFamily="mono"
                fontSize="xs"
                disabled={syncing}
                onClick={() => void startSync()}
                _hover={{ bg: 'rgba(0,255,65,0.08)' }}
              >
                {syncing ? <Spinner size="xs" /> : <RefreshCw size={14} />}
                {syncing ? '同步中...' : '强制同步'}
              </Button>
            )}
          </HStack>
        </Flex>

        <SyncLog lastEvent={lastEvent} progressCount={progressCount} />

        {/* Stock list */}
        <Box flex="1" minH="0" mt={3}>
          {stocksLoading ? (
            <Flex justify="center" align="center" h="100%">
              <Spinner color="brand.matrix" />
            </Flex>
          ) : stocks.length === 0 ? (
            <Flex justify="center" align="center" h="100%">
              <Text color="#555" fontFamily="mono" fontSize="sm">
                暂无数据，请先同步
              </Text>
            </Flex>
          ) : (
            <EquityList
              stocks={stocks}
              selectedCode={selectedStock?.code ?? null}
              onSelect={handleSelect}
            />
          )}
        </Box>
      </Box>

      <EquityDrawer
        stock={selectedStock}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={selectedIndex !== null && selectedIndex > 0}
        hasNext={selectedIndex !== null && selectedIndex < sortedStocks.length - 1}
      />
    </AuthenticatedLayout>
  );
}

export default withAuth(EquityPage);
