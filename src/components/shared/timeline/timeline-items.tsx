'use client';

import { Box } from '@chakra-ui/react';
import type { PositionedItem } from '@/types/timeline';

interface TimelineItemsProps {
  positionedItems: PositionedItem[];
  laneHeight: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function TimelineItems({
  positionedItems,
  laneHeight,
  scrollContainerRef,
}: TimelineItemsProps) {
  return (
    <>
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
            zIndex={1}
          >
            <Renderer w={item.calculatedWidth} h={item.h} scrollContainerRef={scrollContainerRef} />
          </Box>
        );
      })}
    </>
  );
}
