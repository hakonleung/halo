'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import type React from 'react';
import type { TimelineItem, PositionedItem } from '@/types/timeline';
import { calculateTimeUnit, generateLanes, calculatePositionedItems } from '@/utils/timeline';
import { TimelineLabels } from './timeline/timeline-labels';
import { TimelineLanes } from './timeline/timeline-lanes';
import { TimelineItems } from './timeline/timeline-items';

export function TimelineView({
  items,
  start,
  end,
  laneHeight = 80,
  minItemWidth = 60,
  laneWidth = 40,
}: {
  items: TimelineItem[];
  start: Date;
  end: Date;
  laneHeight?: number;
  minItemWidth?: number;
  laneWidth?: number;
}) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; time: string } | null>(null);

  // Calculate time unit based on time range
  const timeUnit = useMemo(() => calculateTimeUnit(start, end), [start, end]);

  // Generate lanes
  const lanes = useMemo(() => generateLanes(start, end, timeUnit), [start, end, timeUnit]);

  // Calculate total width based on number of lanes
  const totalWidth = useMemo(() => lanes.length * laneWidth, [lanes.length, laneWidth]);

  // Overlap detection and position calculation
  const positionedItems = useMemo<PositionedItem[]>(() => {
    return calculatePositionedItems(items, lanes, timeUnit, laneWidth, minItemWidth);
  }, [items, lanes, timeUnit, laneWidth, minItemWidth]);

  const totalHeight = useMemo(() => {
    return positionedItems.length > 0
      ? Math.max(...positionedItems.map((item) => (item.y + 1) * laneHeight), laneHeight)
      : laneHeight;
  }, [positionedItems, laneHeight]);

  // Scroll to right on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [positionedItems]);

  // Handle lane mouse enter for tooltip
  const handleLaneMouseEnter = (event: React.MouseEvent<HTMLDivElement>, laneIndex: number) => {
    const x = event.clientX;
    const y = event.clientY;

    const lane = lanes[laneIndex];
    const timeStr = lane.time.toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    setTooltip({ x, y, time: timeStr });
  };

  // Handle lane mouse leave to hide tooltip
  const handleLaneMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <Box position="relative" w="100%" flex={1} overflow="hidden">
      {/* Tooltip */}
      {tooltip && (
        <Box
          position="fixed"
          left={tooltip.x}
          top={tooltip.y - 30}
          zIndex={1000}
          bg="bg.dark"
          border="1px solid"
          borderColor="brand.matrix"
          borderRadius="4px"
          px={2}
          py={1}
          pointerEvents="none"
        >
          <Text fontSize="xs" color="brand.matrix" fontFamily="mono">
            {tooltip.time}
          </Text>
        </Box>
      )}

      {/* Scrollable container */}
      <Box
        ref={scrollContainerRef}
        w="100%"
        h="100%"
        overflowX="auto"
        overflowY="auto"
        position="relative"
      >
        <TimelineLabels lanes={lanes} laneWidth={laneWidth} />

        <Box pos="relative" h={`${totalHeight}px`} w={`${totalWidth}px`}>
          <TimelineLanes
            lanes={lanes}
            laneWidth={laneWidth}
            totalHeight={totalHeight}
            onLaneMouseEnter={handleLaneMouseEnter}
            onLaneMouseLeave={handleLaneMouseLeave}
          />

          <TimelineItems
            positionedItems={positionedItems}
            laneHeight={laneHeight}
            scrollContainerRef={scrollContainerRef}
          />
        </Box>
      </Box>
    </Box>
  );
}
