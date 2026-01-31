'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import type React from 'react';

export interface TimelineItem {
  Renderer: React.ComponentType<{
    w: number;
    h: number;
    scrollContainerRef?: React.RefObject<HTMLElement | null>;
  }>;
  h: number; // height in pixels
  w: number; // width in pixels (minimum width, will be calculated based on time span)
  start: Date;
  end: Date;
  blockOffset?: number; // Optional block offset for grouping items into different blocks
}

export interface TimelineViewProps {
  items: TimelineItem[];
  start: Date;
  end: Date;
  laneHeight?: number; // height of each lane
  minItemWidth?: number; // minimum width for items
  laneWidth?: number; // width of each vertical lane (default 40px)
}

type TimeUnit = 'hour' | 'day' | 'week' | 'month';

interface Lane {
  time: Date;
  label: string;
  spanLabel: string; // Label for the time span above the lane
}

interface PositionedItem extends TimelineItem {
  x: number; // x position in pixels
  y: number; // y position (lane index)
  calculatedWidth: number; // calculated width based on time span
}

export function TimelineView({
  items,
  start,
  end,
  laneHeight = 80,
  minItemWidth = 60,
  laneWidth = 40,
}: TimelineViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; time: string } | null>(null);

  // Calculate time unit based on time range
  const timeUnit = useMemo<TimeUnit>(() => {
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const diffWeeks = diffDays / 7;

    // hour: <= 7*24 hours (7 days)
    if (diffHours <= 7 * 24) {
      return 'hour';
    } else if (diffDays <= 120) {
      // day: <= 120 days
      return 'day';
    } else if (diffWeeks <= 52) {
      return 'week';
    } else {
      return 'month';
    }
  }, [start, end]);

  // Generate lanes
  const lanes = useMemo<Lane[]>(() => {
    const result: Lane[] = [];
    const current = new Date(start);

    const formatSpanLabel = (date: Date): string => {
      switch (timeUnit) {
        case 'hour':
          // Show weekday and hour: "Mon, 10:00"
          return date.toLocaleString('en-US', {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });
        case 'day':
          // Show weekday: "Mon"
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        case 'week': {
          // Show week range with weekdays: "Mon - Sun"
          const weekStart = new Date(date);
          const dayOfWeek = weekStart.getDay();
          const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as start
          weekStart.setDate(weekStart.getDate() + diff);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          const startWeekday = weekStart.toLocaleDateString('en-US', { weekday: 'short' });
          const endWeekday = weekEnd.toLocaleDateString('en-US', { weekday: 'short' });
          return `${startWeekday} - ${endWeekday}`;
        }
        case 'month':
          // Show month and year: "Jan 2024"
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    };

    const formatLabel = (date: Date): string => {
      switch (timeUnit) {
        case 'hour':
          return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        case 'day':
          return date.toLocaleDateString('en-US', { day: 'numeric' });
        case 'week': {
          const weekStart = new Date(date);
          const dayOfWeek = weekStart.getDay();
          const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          weekStart.setDate(weekStart.getDate() + diff);
          return `${weekStart.getDate()}`;
        }
        case 'month':
          return date.toLocaleDateString('en-US', { month: 'short' });
      }
    };

    while (current <= end) {
      result.push({
        time: new Date(current),
        label: formatLabel(current),
        spanLabel: formatSpanLabel(current),
      });

      // Increment based on time unit
      switch (timeUnit) {
        case 'hour':
          current.setHours(current.getHours() + 1);
          break;
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }

    return result;
  }, [start, end, timeUnit]);

  // Calculate total width based on number of lanes
  const totalWidth = useMemo(() => {
    return lanes.length * laneWidth;
  }, [lanes.length, laneWidth]);

  // Calculate x position for a given time (within a lane)
  const getXPosition = (time: Date): number => {
    // Find which lane this time belongs to
    let laneIndex = 0;
    for (let i = 0; i < lanes.length; i++) {
      const laneStart = lanes[i].time;
      let laneEnd: Date;
      switch (timeUnit) {
        case 'hour':
          laneEnd = new Date(laneStart);
          laneEnd.setHours(laneEnd.getHours() + 1);
          break;
        case 'day':
          laneEnd = new Date(laneStart);
          laneEnd.setDate(laneEnd.getDate() + 1);
          break;
        case 'week':
          laneEnd = new Date(laneStart);
          laneEnd.setDate(laneEnd.getDate() + 7);
          break;
        case 'month':
          laneEnd = new Date(laneStart);
          laneEnd.setMonth(laneEnd.getMonth() + 1);
          break;
      }

      if (time >= laneStart && time < laneEnd) {
        laneIndex = i;
        // Calculate position within the lane
        const laneStartMs = laneStart.getTime();
        const laneEndMs = laneEnd.getTime();
        const timeMs = time.getTime();
        const positionInLane = (timeMs - laneStartMs) / (laneEndMs - laneStartMs);
        return laneIndex * laneWidth + positionInLane * laneWidth;
      }
    }
    // If not found, use the last lane
    return (lanes.length - 1) * laneWidth;
  };

  // Calculate width for a time span
  const getWidth = (itemStart: Date, itemEnd: Date, minWidth: number): number => {
    const startX = getXPosition(itemStart);
    const endX = getXPosition(itemEnd);
    const width = endX - startX;
    return Math.max(width, minWidth);
  };

  // Overlap detection and position calculation
  const positionedItems = useMemo<PositionedItem[]>(() => {
    // Group items by blockOffset
    const itemsByBlock = new Map<number, typeof items>();
    items.forEach((item) => {
      const blockOffset = item.blockOffset || 0;
      if (!itemsByBlock.has(blockOffset)) {
        itemsByBlock.set(blockOffset, []);
      }
      const blockItems = itemsByBlock.get(blockOffset);
      if (blockItems) {
        blockItems.push(item);
      }
    });

    const result: PositionedItem[] = [];

    // Process each block separately
    const sortedBlocks = Array.from(itemsByBlock.entries()).sort((a, b) => a[0] - b[0]);

    // Track cumulative y offset for each block
    let cumulativeYOffset = 0;

    for (const [, blockItems] of sortedBlocks) {
      // Sort items by start time within each block
      const sorted = [...blockItems].sort((a, b) => a.start.getTime() - b.start.getTime());

      const itemLanes: PositionedItem[][] = []; // Each lane is an array of items

      for (const item of sorted) {
        const x = getXPosition(item.start);
        // Use item.w as minimum width, fallback to minItemWidth if not provided
        const minWidth = item.w || minItemWidth;
        // Calculate width based on time span, but ensure minimum width
        const calculatedWidth = getWidth(item.start, item.end, minWidth);

        // Find the first lane where this item doesn't overlap
        let laneIndex = 0;
        let foundLane = false;

        while (!foundLane) {
          if (laneIndex >= itemLanes.length) {
            // Create new lane
            itemLanes.push([]);
            foundLane = true;
          } else {
            // Check if item overlaps with any item in this lane
            const overlaps = itemLanes[laneIndex].some((existing) => {
              const existingEnd = existing.x + existing.calculatedWidth;
              const itemEnd = x + calculatedWidth;
              return !(itemEnd <= existing.x || x >= existingEnd);
            });

            if (!overlaps) {
              foundLane = true;
            } else {
              laneIndex++;
            }
          }
        }

        // Calculate y position with dynamic block offset
        // Each block starts after the previous block's content
        const y = cumulativeYOffset + laneIndex;

        // Add item to lane
        itemLanes[laneIndex].push({
          ...item,
          x,
          y,
          calculatedWidth,
        });

        result.push({
          ...item,
          x,
          y,
          calculatedWidth,
        });
      }

      // Update cumulative offset for next block
      // Add the maximum lane index in this block + 1 (for spacing between blocks)
      const maxLaneIndex = itemLanes.length > 0 ? itemLanes.length - 1 : 0;
      cumulativeYOffset += maxLaneIndex + 1 + 1; // +1 for spacing between blocks
    }

    return result;
  }, [items, lanes, timeUnit, laneWidth, minItemWidth]);

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
    <Box position="relative" w="100%" h="100%">
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
        overflowY="hidden"
        position="relative"
      >
        {/* Timeline lanes */}
        <Box position="relative" minW={totalWidth} pt="25px" h="100%">
          {/* Span labels above lanes (absolute positioned inside container) - show every 5th lane */}
          <Box position="absolute" top="0" left={0} right={0} h="25px" zIndex={20}>
            {lanes.map((lane, index) => {
              // Only show label every 5 lanes
              if (index % 5 !== 0) return null;

              return (
                <Box
                  key={index}
                  position="absolute"
                  left={`${index * laneWidth}px`}
                  top={0}
                  w={`${laneWidth * 5}px`}
                  h="100%"
                >
                  <Text
                    fontSize="2xs"
                    color="text.mist"
                    fontFamily="mono"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {lane.spanLabel}
                  </Text>
                </Box>
              );
            })}
          </Box>

          {/* Items container */}
          <Box
            position="relative"
            minH={`${
              positionedItems.length > 0
                ? Math.max(...positionedItems.map((item) => (item.y + 1) * laneHeight), laneHeight)
                : laneHeight
            }px`}
          >
            {/* Vertical lane lines with clickable area - behind items */}
            {lanes.map((_lane, index) => {
              const laneX = index * laneWidth;
              return (
                <Box
                  key={index}
                  position="absolute"
                  left={`${laneX}px`}
                  top={0}
                  bottom={0}
                  w={`${laneWidth}px`}
                  zIndex={0}
                >
                  {/* Clickable hot zone (16px wide, centered on the line) */}
                  <Box
                    position="absolute"
                    left={`${laneWidth / 2 - 8}px`}
                    top={0}
                    bottom={0}
                    w="16px"
                    cursor="pointer"
                    onMouseEnter={(e) => handleLaneMouseEnter(e, index)}
                    onMouseLeave={handleLaneMouseLeave}
                    zIndex={1}
                  />
                  {/* Dashed line (1px wide) */}
                  <Box
                    position="absolute"
                    left={`${laneWidth / 2}px`}
                    top={0}
                    bottom={0}
                    w="1px"
                    borderLeft="1px dashed"
                    borderColor="rgba(0, 255, 65, 0.3)"
                    pointerEvents="none"
                    zIndex={0}
                  />
                </Box>
              );
            })}
            {positionedItems.map((item, index) => {
              const Renderer = item.Renderer;
              return (
                <Box
                  key={index}
                  position="absolute"
                  left={`${item.x}px`}
                  top={`${item.y * laneHeight}px`}
                  w={`${item.calculatedWidth}px`}
                  h={`${item.h}px`}
                  zIndex={2}
                >
                  <Renderer
                    w={item.calculatedWidth}
                    h={item.h}
                    scrollContainerRef={scrollContainerRef}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
