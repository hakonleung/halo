'use client';

import { Box, Text } from '@chakra-ui/react';
import type { Lane } from '@/types/timeline';

interface TimelineLabelsProps {
  lanes: Lane[];
  laneWidth: number;
}

export function TimelineLabels({ lanes, laneWidth }: TimelineLabelsProps) {
  return (
    <Box pos="sticky" top={0} h="24px" zIndex={2}>
      {lanes.map((lane, index) => {
        if (index % 5 !== 0) return null;
        return (
          <Text
            key={index}
            position="absolute"
            left={`${index * laneWidth}px`}
            top={0}
            backdropFilter="blur(10px)"
            fontSize="2xs"
            color="text.mist"
            fontFamily="mono"
            whiteSpace="nowrap"
          >
            {lane.spanLabel}
          </Text>
        );
      })}
    </Box>
  );
}
