'use client';

import { useState, useMemo } from 'react';
import { Container, VStack, Box, Card } from '@chakra-ui/react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { DateRangePicker } from '@/components/log/date-range-picker';
import { LogTimeline } from '@/components/log/log-timeline';
import type { TimeRange } from '@/types/dashboard-client';

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function LogPage() {
  // Initialize with last 7 days
  const initialTimeRange = useMemo<TimeRange>(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    return {
      type: 'custom',
      start: formatDate(sevenDaysAgo),
      end: formatDate(today),
    };
  }, []);

  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);

  return (
    <AuthenticatedLayout>
      <Container maxW="1400px" py={2} display="flex" flexDirection="column">
        <VStack gap={2} align="stretch" h="full" overflow="hidden">
          {/* Global Time Range Selector */}
          <Box flexShrink={0}>
            <Card.Root size="sm">
              <Card.Body p={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <DateRangePicker value={timeRange} onChange={setTimeRange} />
                </Box>
              </Card.Body>
            </Card.Root>
          </Box>

          {/* Timeline */}
          <LogTimeline timeRange={timeRange} />
        </VStack>
      </Container>
    </AuthenticatedLayout>
  );
}
