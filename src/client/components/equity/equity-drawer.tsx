'use client';

import { Box, Drawer, HStack, Portal, Text, Spinner, Flex } from '@chakra-ui/react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useEquityDailyBars } from '@/client/hooks/use-equity';

import { EquityKlineChart } from './equity-kline-chart';

import type { EquityRange, EquityStockSummary } from '@/client/types/equity-client';

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
  const { bars, isLoading } = useEquityDailyBars(stock?.code ?? null);

  // Arrow key navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hasPrev) onPrev();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (hasNext) onNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, hasPrev, hasNext, onPrev, onNext]);

  const isGain = (stock?.change_pct_1d ?? 0) >= 0;
  const priceColor = isGain ? '#FF4444' : '#00FF41';

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
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
                    <Text fontFamily="mono" fontSize="sm" color="#888">
                      {stock.name}
                    </Text>
                    <Text
                      fontFamily="mono"
                      fontSize="10px"
                      px={2}
                      py={0.5}
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      borderRadius="2px"
                      color="#666"
                    >
                      {stock.market}
                    </Text>
                  </HStack>
                  <HStack gap={4}>
                    {stock.close != null && (
                      <Text fontFamily="mono" fontSize="xl" color={priceColor} fontWeight="bold">
                        {stock.close.toFixed(2)}
                      </Text>
                    )}
                    {stock.change_pct_1d != null && (
                      <Text fontFamily="mono" fontSize="sm" color={priceColor}>
                        {stock.change_pct_1d >= 0 ? '+' : ''}
                        {stock.change_pct_1d.toFixed(2)}%
                      </Text>
                    )}
                    <HStack gap={0}>
                      <Box
                        as="button"
                        p={1}
                        borderRadius="2px"
                        color={hasPrev ? '#888' : '#333'}
                        cursor={hasPrev ? 'pointer' : 'not-allowed'}
                        _hover={hasPrev ? { color: 'brand.matrix' } : {}}
                        onClick={hasPrev ? onPrev : undefined}
                        title="上一只 ↑"
                      >
                        <ChevronUp size={16} />
                      </Box>
                      <Box
                        as="button"
                        p={1}
                        borderRadius="2px"
                        color={hasNext ? '#888' : '#333'}
                        cursor={hasNext ? 'pointer' : 'not-allowed'}
                        _hover={hasNext ? { color: 'brand.matrix' } : {}}
                        onClick={hasNext ? onNext : undefined}
                        title="下一只 ↓"
                      >
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
                  <Text color="#555" fontFamily="mono" fontSize="sm">
                    暂无 K 线数据
                  </Text>
                </Flex>
              ) : (
                <EquityKlineChart bars={bars} range={range} onRangeChange={setRange} />
              )}
            </Drawer.Body>
            <Drawer.CloseTrigger
              position="absolute"
              top={3}
              right={3}
              color="#666"
              _hover={{ color: '#fff' }}
            />
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
