'use client';

import { useState } from 'react';
import { Box, Switch, HStack, Card, Text } from '@chakra-ui/react';
import type { TimeRange } from '@/types/dashboard-client';
import { SplitLogTimeline } from '@/components/log/timeline/split-log-timeline';
import { MergeLogTimeline } from '@/components/log/timeline/merge-log-timeline';

type ViewMode = 'split' | 'merge';

interface LogTimelineProps {
  timeRange: TimeRange;
}

export function LogTimeline({ timeRange }: LogTimelineProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('merge');
  const isMergeMode = viewMode === 'merge';

  return (
    <Box w="100%" h="100%" display="flex" flexDirection="column">
      {/* View mode selector */}
      <Box flexShrink={0} mb={2}>
        <Card.Root size="sm">
          <Card.Body p={2}>
            <HStack gap={3} justify="space-between">
              <Switch.Root
                size="sm"
                checked={isMergeMode}
                onCheckedChange={(e) => {
                  setViewMode(e.checked ? 'merge' : 'split');
                }}
              >
                <Switch.HiddenInput />
                <Switch.Label>
                  <Text fontSize="xs" color="text.mist" fontFamily="mono">
                    {isMergeMode ? 'Merge' : 'Split'}
                  </Text>
                </Switch.Label>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
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
