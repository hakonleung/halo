'use client';

import { useState } from 'react';
import { Box, Button, HStack, Card } from '@chakra-ui/react';
import type { TimeRange } from '@/types/dashboard-client';
import { SplitLogTimeline } from '@/components/log/split-log-timeline';
import { MergeLogTimeline } from '@/components/log/merge-log-timeline';

type ViewMode = 'split' | 'merge';

interface LogTimelineProps {
  timeRange: TimeRange;
}

export function LogTimeline({ timeRange }: LogTimelineProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  return (
    <Box w="100%" h="100%" display="flex" flexDirection="column">
      {/* View mode selector */}
      <Box flexShrink={0} mb={2}>
        <Card.Root size="sm">
          <Card.Body p={2}>
            <HStack gap={2}>
              <Button
                size="xs"
                variant={viewMode === 'split' ? 'solid' : 'outline'}
                colorScheme={viewMode === 'split' ? 'green' : 'gray'}
                onClick={() => setViewMode('split')}
              >
                Split
              </Button>
              <Button
                size="xs"
                variant={viewMode === 'merge' ? 'solid' : 'outline'}
                colorScheme={viewMode === 'merge' ? 'green' : 'gray'}
                onClick={() => setViewMode('merge')}
              >
                Merge
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>
      </Box>

      {/* Timeline view */}
      <Box flex={1} minH="400px" overflow="hidden">
        {viewMode === 'split' ? (
          <SplitLogTimeline timeRange={timeRange} />
        ) : (
          <MergeLogTimeline timeRange={timeRange} />
        )}
      </Box>
    </Box>
  );
}
