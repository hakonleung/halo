'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import type React from 'react';
import type { TimelineItem, PositionedItem } from '@/client/types/timeline';
import { generateLanes, calculatePositionedItems } from '@/client/utils/timeline';
import { TimelineLabels } from './timeline-labels';
import { TimelineLanes } from './timeline-lanes';
import { TimelineItems } from './timeline-items';
import { TimelineZoomControls } from './timeline-zoom-controls';
import { useCallback } from 'react';
import type { TimeUnit } from '@/client/types/timeline';
import { calculateTimeUnit } from '@/client/utils/timeline';

const TIME_UNITS: TimeUnit[] = ['hour', 'day', 'week', 'month'];
const MIN_LANE_WIDTH = 10;
const MAX_LANE_WIDTH = 80;
const ZOOM_STEP = 5;

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

  // Zoom logic extracted to hook
  const { currentLaneWidth, currentTimeUnit, handleZoomIn, handleZoomOut, canZoomIn, canZoomOut } =
    useTimelineZoom({
      start,
      end,
      defaultLaneWidth: laneWidth,
    });

  // Generate lanes based on current zoom
  const lanes = useMemo(
    () => generateLanes(start, end, currentTimeUnit),
    [start, end, currentTimeUnit],
  );

  // Calculate total width based on number of lanes and current lane width
  const totalWidth = useMemo(
    () => lanes.length * currentLaneWidth,
    [lanes.length, currentLaneWidth],
  );

  // Overlap detection and position calculation
  const positionedItems = useMemo<PositionedItem[]>(() => {
    return calculatePositionedItems(items, lanes, currentTimeUnit, currentLaneWidth, minItemWidth);
  }, [items, lanes, currentTimeUnit, currentLaneWidth, minItemWidth]);

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
      {/* Zoom Controls */}
      <TimelineZoomControls
        currentTimeUnit={currentTimeUnit}
        currentLaneWidth={currentLaneWidth}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
      />

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
        <TimelineLabels lanes={lanes} laneWidth={currentLaneWidth} />

        <Box pos="relative" h={`${totalHeight}px`} w={`${totalWidth}px`}>
          <TimelineLanes
            lanes={lanes}
            laneWidth={currentLaneWidth}
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

function useTimelineZoom({
  start,
  end,
  defaultLaneWidth,
}: {
  start: Date;
  end: Date;
  defaultLaneWidth: number;
}) {
  const [currentLaneWidth, setCurrentLaneWidth] = useState(defaultLaneWidth);
  const [currentTimeUnit, setCurrentTimeUnit] = useState<TimeUnit>(() =>
    calculateTimeUnit(start, end),
  );

  useEffect(() => {
    setCurrentLaneWidth(defaultLaneWidth);
    setCurrentTimeUnit(calculateTimeUnit(start, end));
  }, [start, end, defaultLaneWidth]);

  const handleZoomIn = useCallback(() => {
    if (currentLaneWidth < MAX_LANE_WIDTH) {
      setCurrentLaneWidth((prev) => Math.min(MAX_LANE_WIDTH, prev + ZOOM_STEP));
    } else {
      const currentIndex = TIME_UNITS.indexOf(currentTimeUnit);
      if (currentIndex > 0) {
        setCurrentTimeUnit(TIME_UNITS[currentIndex - 1]);
        setCurrentLaneWidth(MIN_LANE_WIDTH);
      }
    }
  }, [currentLaneWidth, currentTimeUnit]);

  const handleZoomOut = useCallback(() => {
    if (currentLaneWidth > MIN_LANE_WIDTH) {
      setCurrentLaneWidth((prev) => Math.max(MIN_LANE_WIDTH, prev - ZOOM_STEP));
    } else {
      const currentIndex = TIME_UNITS.indexOf(currentTimeUnit);
      if (currentIndex < TIME_UNITS.length - 1) {
        setCurrentTimeUnit(TIME_UNITS[currentIndex + 1]);
        setCurrentLaneWidth(MAX_LANE_WIDTH);
      }
    }
  }, [currentLaneWidth, currentTimeUnit]);

  return {
    currentLaneWidth,
    currentTimeUnit,
    handleZoomIn,
    handleZoomOut,
    canZoomIn: !(currentTimeUnit === 'hour' && currentLaneWidth === MAX_LANE_WIDTH),
    canZoomOut: !(currentTimeUnit === 'month' && currentLaneWidth === MIN_LANE_WIDTH),
  };
}
