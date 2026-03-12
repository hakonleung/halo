'use client';

import { Box, Drawer, HStack, Portal, Text, Spinner, Flex } from '@chakra-ui/react';
import { ChevronUp, ChevronDown, GitCompare, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useEquityDailyBars, usePatternSimilarity } from '../hooks';

import { EquityKlineChart } from './equity-kline-chart';
import type { KlineMode } from './equity-kline-chart';
import { SimilarPatternsPanel } from './similar-patterns-panel';

import type { EquityRange, EquityStockSummary } from '../types';

interface Props {
  stock: EquityStockSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function EquityDrawer({ stock, isOpen, onClose, onPrev, onNext, hasPrev, hasNext }: Props) {
  const [range, setRange] = useState<EquityRange>('3M');
  const [chartMode, setChartMode] = useState<KlineMode>('view');
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>(null);
  const [showSimilar, setShowSimilar] = useState(false);

  const { bars, isLoading } = useEquityDailyBars(stock?.code ?? null);
  const { findSimilar, loading: similarLoading, statusMsg, matches } = usePatternSimilarity();

  // Reset when stock changes
  useEffect(() => {
    setShowSimilar(false);
    setChartMode('view');
    setSelectedRange(null);
  }, [stock?.code]);

  // Arrow key navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); if (hasPrev) onPrev(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); if (hasNext) onNext(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, hasPrev, hasNext, onPrev, onNext]);

  const isGain = (stock?.change_pct_1d ?? 0) >= 0;
  const priceColor = isGain ? '#FF4444' : '#00FF41';

  function handleFindSimilarClick() {
    if (!stock) return;
    if (chartMode === 'select') {
      // Cancel selection
      setChartMode('view');
      return;
    }
    setShowSimilar(true);
    setChartMode('select');
  }

  function handleRangeSelected(start: string, end: string) {
    if (!stock) return;
    setSelectedRange({ start, end });
    setChartMode('highlight');
    void findSimilar({ code: stock.code, startDate: start, endDate: end });
  }

  function handleCloseSimilar() {
    setShowSimilar(false);
    setChartMode('view');
    setSelectedRange(null);
  }

  const findBtnActive = chartMode === 'select' || showSimilar;

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(e) => { if (!e.open) onClose(); }}
      placement="end"
      size="xl"
    >
      <Portal>
        <Drawer.Backdrop bg="rgba(0,0,0,0.7)" />
        <Drawer.Positioner>
          <Drawer.Content bg="#0F0F0F" borderLeft="1px solid rgba(0,255,65,0.2)">
            <Drawer.Header borderBottom="1px solid rgba(0,255,65,0.1)" pb={3}>
              {stock && (
                <HStack justify="space-between" w="full" pr={8}>
                  <HStack gap={3}>
                    <Text fontFamily="mono" fontSize="lg" color="brand.matrix" fontWeight="bold">
                      {stock.code}
                    </Text>
                    <Text fontFamily="mono" fontSize="sm" color="#888">{stock.name}</Text>
                    <Text fontFamily="mono" fontSize="10px" px={2} py={0.5} border="1px solid"
                      borderColor="whiteAlpha.200" borderRadius="2px" color="#666">
                      {stock.market}
                    </Text>
                  </HStack>
                  <HStack gap={3}>
                    {stock.close != null && (
                      <Text fontFamily="mono" fontSize="xl" color={priceColor} fontWeight="bold">
                        {stock.close.toFixed(2)}
                      </Text>
                    )}
                    {stock.change_pct_1d != null && (
                      <Text fontFamily="mono" fontSize="sm" color={priceColor}>
                        {stock.change_pct_1d >= 0 ? '+' : ''}{stock.change_pct_1d.toFixed(2)}%
                      </Text>
                    )}
                    {/* Find similar button */}
                    <Box as="button" px={2} py={1} borderRadius="2px" border="1px solid"
                      borderColor={findBtnActive ? (chartMode === 'select' ? '#FF6B35' : 'brand.matrix') : 'rgba(0,255,65,0.2)'}
                      color={findBtnActive ? (chartMode === 'select' ? '#FF6B35' : 'brand.matrix') : '#666'}
                      cursor="pointer"
                      _hover={{ borderColor: chartMode === 'select' ? '#FF6B35' : 'brand.matrix', color: chartMode === 'select' ? '#FF6B35' : 'brand.matrix' }}
                      onClick={handleFindSimilarClick}
                      title={chartMode === 'select' ? '取消选择' : '查找相似走势'}
                      display="flex" alignItems="center" gap={1}>
                      <GitCompare size={12} />
                      <Text fontFamily="mono" fontSize="10px">
                        {chartMode === 'select' ? '取消' : '查找相似'}
                      </Text>
                    </Box>
                    <HStack gap={0}>
                      <Box as="button" p={1} borderRadius="2px"
                        color={hasPrev ? '#888' : '#333'} cursor={hasPrev ? 'pointer' : 'not-allowed'}
                        _hover={hasPrev ? { color: 'brand.matrix' } : {}}
                        onClick={hasPrev ? onPrev : undefined} title="上一只 ↑">
                        <ChevronUp size={16} />
                      </Box>
                      <Box as="button" p={1} borderRadius="2px"
                        color={hasNext ? '#888' : '#333'} cursor={hasNext ? 'pointer' : 'not-allowed'}
                        _hover={hasNext ? { color: 'brand.matrix' } : {}}
                        onClick={hasNext ? onNext : undefined} title="下一只 ↓">
                        <ChevronDown size={16} />
                      </Box>
                    </HStack>
                  </HStack>
                </HStack>
              )}
            </Drawer.Header>

            <Drawer.Body p={4}>
              {isLoading ? (
                <Flex justify="center" align="center" h="200px">
                  <Spinner color="brand.matrix" />
                </Flex>
              ) : bars.length === 0 ? (
                <Flex justify="center" align="center" h="200px">
                  <Text color="#555" fontFamily="mono" fontSize="sm">暂无 K 线数据</Text>
                </Flex>
              ) : (
                <>
                  <EquityKlineChart
                    bars={bars}
                    range={range}
                    onRangeChange={setRange}
                    mode={chartMode}
                    onSelectRange={handleRangeSelected}
                    highlightStart={selectedRange?.start}
                    highlightEnd={selectedRange?.end}
                  />
                  {showSimilar && (
                    <Box mt={4} pt={4} borderTop="1px solid rgba(0,255,65,0.1)">
                      <HStack justify="space-between" mb={2}>
                        <Box />
                        <Box as="button" p={1} color="#555" cursor="pointer"
                          _hover={{ color: '#888' }} onClick={handleCloseSimilar} title="关闭">
                          <X size={14} />
                        </Box>
                      </HStack>
                      <SimilarPatternsPanel
                        matches={matches}
                        isLoading={similarLoading}
                        statusMsg={statusMsg}
                      />
                    </Box>
                  )}
                </>
              )}
            </Drawer.Body>

            <Drawer.CloseTrigger position="absolute" top={3} right={3}
              color="#666" _hover={{ color: '#fff' }} />
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
