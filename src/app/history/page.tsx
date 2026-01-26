'use client';

import { Box, Heading, VStack, HStack, Text, Spinner } from '@chakra-ui/react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { useHistory } from '@/hooks/use-history';
import { useState } from 'react';
import type { HistoryListRequest } from '@/types/history-client';
import { HistoryList } from '@/components/history/history-list';
import { HistoryFilters } from '@/components/history/history-filters';
import { SortOrder } from '@/types/history-server';

export default function HistoryPage() {
  const [filters, setFilters] = useState<HistoryListRequest>({
    type: 'all',
    page: 1,
    pageSize: 20,
    sortOrder: SortOrder.Desc,
  });

  const { data, isLoading, error } = useHistory(filters);

  const handleFilterChange = (newFilters: Partial<HistoryListRequest>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <AuthenticatedLayout>
      <VStack gap={8} align="stretch" w="full" maxW="1200px" mx="auto" p={4}>
        <HStack justify="space-between">
          <Box>
            <Heading size="xl" color="brand.matrix" mb={2}>
              HISTORY
            </Heading>
            <Text color="text.mist" fontFamily="mono" fontSize="sm">
              [ SYSTEM LOG ARCHIVE ]
            </Text>
          </Box>
        </HStack>

        <HistoryFilters filters={filters} onFilterChange={handleFilterChange} />

        {isLoading ? (
          <HStack justify="center" py={20}>
            <Spinner size="xl" color="brand.matrix" />
          </HStack>
        ) : error ? (
          <Box
            p={4}
            bg="rgba(255, 51, 102, 0.1)"
            border="1px solid"
            borderColor="red.500"
            borderRadius="4px"
          >
            <Text color="red.500" fontFamily="mono">
              Error: {(error as Error).message}
            </Text>
          </Box>
        ) : (
          <HistoryList
            items={data?.items || []}
            total={data?.total || 0}
            page={filters.page || 1}
            pageSize={filters.pageSize || 20}
            onPageChange={handlePageChange}
          />
        )}
      </VStack>
    </AuthenticatedLayout>
  );
}
