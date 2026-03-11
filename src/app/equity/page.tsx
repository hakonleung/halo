'use client';

import { Box, Flex, HStack, VStack, Text, Button, IconButton, Spinner } from '@chakra-ui/react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { withAuth } from '@/client/components/auth/with-auth';
import { EquityKlineChart, StockSearchBar } from '@/client/components/equity';
import { AuthenticatedLayout } from '@/client/components/layout/authenticated-layout';
import {
  useEquityStocks,
  useEquityDailyBars,
  useAddEquityStock,
  useDeleteEquityStock,
  useSyncEquity,
} from '@/client/hooks/use-equity';

import type { EquityRange, EquitySearchResult } from '@/client/types/equity-client';

function EquityPage() {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [range, setRange] = useState<EquityRange>('3M');

  const { stocks, isLoading: stocksLoading } = useEquityStocks();
  const { bars, isLoading: barsLoading } = useEquityDailyBars(selectedCode);
  const addStock = useAddEquityStock();
  const deleteStock = useDeleteEquityStock();
  const sync = useSyncEquity();

  const selectedStock = stocks.find((s) => s.code === selectedCode);

  const handleSelect = async (result: EquitySearchResult) => {
    // Check if already tracked
    const existing = stocks.find((s) => s.code === result.code);
    if (existing) {
      setSelectedCode(result.code);
      return;
    }
    await addStock.mutateAsync(result);
    setSelectedCode(result.code);
  };

  const handleDelete = async (code: string) => {
    await deleteStock.mutateAsync(code);
    if (selectedCode === code) setSelectedCode(null);
  };

  const lastSyncedAt = selectedStock?.last_synced_at
    ? new Date(selectedStock.last_synced_at).toLocaleString('zh-CN')
    : null;

  return (
    <AuthenticatedLayout>
      <Box px={{ base: 4, md: 8 }} py={6} maxW="1400px" mx="auto">
        {/* Header */}
        <Flex align="center" justify="space-between" mb={6} wrap="wrap" gap={3}>
          <VStack align="flex-start" gap={0}>
            <Text
              fontFamily="heading"
              fontSize="2xl"
              color="brand.matrix"
              textShadow="0 0 10px currentColor"
            >
              EQUITY
            </Text>
            {lastSyncedAt && (
              <Text fontSize="xs" color="text.mist" fontFamily="mono">
                最近同步: {lastSyncedAt}
              </Text>
            )}
          </VStack>

          <HStack gap={3}>
            <StockSearchBar onSelect={handleSelect} />
            <Button
              size="sm"
              variant="outline"
              colorScheme="green"
              borderColor="brand.matrix"
              color="brand.matrix"
              fontFamily="mono"
              fontSize="xs"
              loading={sync.isPending}
              onClick={() => sync.mutate()}
              _hover={{ bg: 'rgba(0,255,65,0.08)' }}
            >
              <RefreshCw size={14} />
              强制同步
            </Button>
          </HStack>
        </Flex>

        <Flex gap={4} direction={{ base: 'column', lg: 'row' }}>
          {/* Watchlist sidebar */}
          <Box
            w={{ base: '100%', lg: '200px' }}
            flexShrink={0}
            bg="#1A1A1A"
            border="1px solid rgba(0,255,65,0.15)"
            borderRadius="4px"
            p={3}
          >
            <Text
              fontSize="xs"
              color="text.mist"
              fontFamily="mono"
              mb={3}
              textTransform="uppercase"
            >
              自选股
            </Text>
            {stocksLoading ? (
              <Spinner size="sm" color="brand.matrix" />
            ) : stocks.length === 0 ? (
              <Text fontSize="xs" color="text.dim" fontFamily="mono">
                搜索并添加股票
              </Text>
            ) : (
              <VStack gap={1} align="stretch">
                {stocks.map((s) => (
                  <HStack
                    key={s.code}
                    px={2}
                    py={1.5}
                    borderRadius="4px"
                    cursor="pointer"
                    bg={selectedCode === s.code ? 'rgba(0,255,65,0.1)' : 'transparent'}
                    border="1px solid"
                    borderColor={selectedCode === s.code ? 'brand.matrix' : 'transparent'}
                    _hover={{ bg: 'rgba(0,255,65,0.06)' }}
                    onClick={() => setSelectedCode(s.code)}
                    justify="space-between"
                  >
                    <VStack gap={0} align="flex-start">
                      <Text fontSize="xs" fontFamily="mono" color="brand.matrix">
                        {s.code}
                      </Text>
                      <Text
                        fontSize="10px"
                        color="text.mist"
                        overflow="hidden"
                        whiteSpace="nowrap"
                        maxW="120px"
                        textOverflow="ellipsis"
                      >
                        {s.name}
                      </Text>
                    </VStack>
                    <IconButton
                      aria-label="Remove"
                      size="xs"
                      variant="ghost"
                      color="text.dim"
                      _hover={{ color: 'red.400' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDelete(s.code);
                      }}
                    >
                      <Trash2 size={12} />
                    </IconButton>
                  </HStack>
                ))}
              </VStack>
            )}
          </Box>

          {/* Chart area */}
          <Box
            flex={1}
            bg="#1A1A1A"
            border="1px solid rgba(0,255,65,0.15)"
            borderRadius="4px"
            p={4}
            minH="540px"
          >
            {!selectedCode ? (
              <Flex align="center" justify="center" h="100%" minH="400px">
                <Text color="text.mist" fontFamily="mono" fontSize="sm">
                  选择或搜索股票查看 K 线
                </Text>
              </Flex>
            ) : barsLoading ? (
              <Flex align="center" justify="center" h="100%" minH="400px">
                <VStack gap={3}>
                  <Spinner color="brand.matrix" size="lg" />
                  <Text color="text.mist" fontFamily="mono" fontSize="sm">
                    加载中...
                  </Text>
                </VStack>
              </Flex>
            ) : bars.length === 0 ? (
              <Flex align="center" justify="center" h="100%" minH="400px">
                <VStack gap={3}>
                  <Text color="text.mist" fontFamily="mono" fontSize="sm">
                    暂无数据，请点击"强制同步"
                  </Text>
                </VStack>
              </Flex>
            ) : (
              <Box>
                <HStack mb={4} gap={3}>
                  <Text fontFamily="mono" fontSize="lg" color="brand.matrix" fontWeight="bold">
                    {selectedStock?.code}
                  </Text>
                  <Text fontFamily="mono" fontSize="sm" color="text.mist">
                    {selectedStock?.name}
                  </Text>
                  {selectedStock?.market && (
                    <Text
                      fontFamily="mono"
                      fontSize="10px"
                      px={2}
                      py={0.5}
                      border="1px solid"
                      borderColor="whiteAlpha.300"
                      borderRadius="2px"
                      color="text.mist"
                    >
                      {selectedStock.market}
                    </Text>
                  )}
                </HStack>
                <EquityKlineChart bars={bars} range={range} onRangeChange={setRange} />
              </Box>
            )}
          </Box>
        </Flex>
      </Box>
    </AuthenticatedLayout>
  );
}

export default withAuth(EquityPage);
