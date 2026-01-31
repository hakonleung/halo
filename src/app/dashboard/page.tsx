'use client';

import { useState } from 'react';
import { Box, Flex, SimpleGrid, VStack, Button } from '@chakra-ui/react';
import { ArrowClockwise } from 'phosphor-react';
import { useQueryClient } from '@tanstack/react-query';
import { withAuth } from '@/components/auth/with-auth';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import {
  TimeRangeSelector,
  StatsCardGroup,
  TrendLineChart,
  CalendarHeatmap,
  GoalProgressSection,
} from '@/components/dashboard';
import { useDashboardStats, useTrends, useHeatmap } from '@/hooks/use-dashboard';
import type { TimeRange } from '@/types/dashboard-client';
import { TimeRangePreset } from '@/types/dashboard-client';

function DashboardContent() {
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState<TimeRange>({
    type: 'preset',
    value: TimeRangePreset.Last7Days,
  });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Fetch data
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: trends, isLoading: trendsLoading } = useTrends(
    timeRange,
    selectedTypes.length > 0 ? selectedTypes : undefined,
  );
  const { data: heatmap, isLoading: heatmapLoading } = useHeatmap(12);

  // Handle type filter toggle
  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId],
    );
  };

  // Handle heatmap day click
  const handleDayClick = (_date: string) => {
    // Could open a modal here to show day details
  };

  // Refresh all data
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return (
    <AuthenticatedLayout>
      <Box p={{ base: 3, md: 4, lg: 5 }} maxW="1400px" mx="auto">
        <VStack gap={{ base: 3, md: 4 }} align="stretch">
          {/* Header */}
          <Flex
            justify="flex-end"
            align={{ base: 'flex-start', md: 'center' }}
            direction={{ base: 'column', md: 'row' }}
            gap={4}
          >
            <Flex gap={2}>
              <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
              <Button
                variant="outline"
                size="sm"
                borderColor="brand.matrix"
                color="text.neon"
                onClick={handleRefresh}
                _hover={{
                  bg: 'rgba(0, 255, 65, 0.1)',
                }}
              >
                <ArrowClockwise size={16} />
              </Button>
            </Flex>
          </Flex>

          {/* Stats Cards */}
          <StatsCardGroup stats={stats} loading={statsLoading} />

          {/* Trend Chart */}
          <TrendLineChart
            data={trends}
            loading={trendsLoading}
            selectedTypes={selectedTypes}
            onTypeToggle={handleTypeToggle}
          />

          {/* Heatmap & Goals */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 3, md: 4 }}>
            <CalendarHeatmap data={heatmap} loading={heatmapLoading} onDayClick={handleDayClick} />
            <GoalProgressSection loading={statsLoading} />
          </SimpleGrid>
        </VStack>
      </Box>
    </AuthenticatedLayout>
  );
}

export default withAuth(DashboardContent);
