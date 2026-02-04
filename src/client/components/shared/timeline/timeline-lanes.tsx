'use client';

import { Box, Center } from '@chakra-ui/react';

import type { Lane } from '@/client/types/timeline';

interface TimelineLanesProps {
  lanes: Lane[];
  laneWidth: number;
  totalHeight: number;
  onLaneMouseEnter: (event: React.MouseEvent<HTMLDivElement>, index: number) => void;
  onLaneMouseLeave: () => void;
}

export function TimelineLanes({
  lanes,
  laneWidth,
  totalHeight,
  onLaneMouseEnter,
  onLaneMouseLeave,
}: TimelineLanesProps) {
  return (
    <>
      {lanes.map((_lane, index) => {
        const laneX = index * laneWidth;
        return (
          <Center
            key={index}
            position="absolute"
            left={`${laneX}px`}
            top={0}
            bottom={0}
            zIndex={0}
            w="16px"
            h={`${totalHeight}px`}
            onMouseEnter={(e) => onLaneMouseEnter(e, index)}
            onMouseLeave={onLaneMouseLeave}
            cursor="pointer"
          >
            <Box
              w="1px"
              h="100%"
              borderLeft="1px dashed"
              borderColor="rgba(0, 255, 65, 0.3)"
              pointerEvents="none"
            />
          </Center>
        );
      })}
    </>
  );
}
