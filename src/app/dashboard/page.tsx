'use client';

import { useState } from 'react';
import { Box, Flex, SimpleGrid, VStack } from '@chakra-ui/react';
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

  return (
    <AuthenticatedLayout>
      <Box p={{ base: 2, md: 3 }} maxW="1400px" mx="auto">
        <VStack gap={{ base: 2, md: 3 }} align="stretch">
          {/* Header */}
          <Flex justify="flex-end" align="center">
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </Flex>

          {/* Desktop: 2x2 Grid, Mobile: 4 rows */}
          {/* Priority: metric => heatmap => trend => progress */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 2, md: 3 }}>
            {/* Row 1, Col 1: Metric (first row on mobile) */}
            <Box>
              <StatsCardGroup stats={stats} loading={statsLoading} />
            </Box>

            {/* Row 1, Col 2: Heatmap (second row on mobile) */}
            <Box>
              <CalendarHeatmap
                data={heatmap}
                loading={heatmapLoading}
                onDayClick={handleDayClick}
              />
            </Box>

            {/* Row 2, Col 1: Trend (third row on mobile) */}
            <Box>
              <TrendLineChart
                data={trends}
                loading={trendsLoading}
                selectedTypes={selectedTypes}
                onTypeToggle={handleTypeToggle}
              />
            </Box>

            {/* Row 2, Col 2: Progress (fourth row on mobile) */}
            <Box>
              <GoalProgressSection loading={statsLoading} />
            </Box>
          </SimpleGrid>
        </VStack>
      </Box>
    </AuthenticatedLayout>
  );
}

export default withAuth(DashboardContent);
