'use client';

import { useMemo } from 'react';
import { Box, Center, Text } from '@chakra-ui/react';
import type { Lane } from '@/types/timeline';

interface TimelineLabelsProps {
  lanes: Lane[];
  laneWidth: number;
}

export function TimelineLabels({ lanes, laneWidth }: TimelineLabelsProps) {
  // Determine how many lanes to skip based on laneWidth to keep labels readable
  // Target around 100px-150px per label
  const labelInterval = useMemo(() => {
    const targetWidth = 100;
    return Math.max(1, Math.ceil(targetWidth / laneWidth));
  }, [laneWidth]);

  const formatLabel = (date: Date) => {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${mm}/${dd} ${hh}:${min}`;
  };

  return (
    <Box pos="sticky" top={0} h="24px" zIndex={2} ml={2}>
      {lanes.map((lane, index) => {
        if (index % labelInterval !== 0) return null;
        return (
          <Center
            key={index}
            position="absolute"
            left={`${index * laneWidth}px`}
            top={0}
            h="100%"
            transform="translateX(-50%)"
            backdropFilter="blur(2px)"
          >
            <Box
              position="absolute"
              left="50%"
              transform="translateX(-50%)"
              top={0}
              w="1px"
              h="100%"
              borderLeft="1px dashed"
              borderColor="rgba(0, 255, 65, 0.3)"
              pointerEvents="none"
              zIndex={1}
            />
            <Text
              left="4px"
              top={0}
              fontSize="2xs"
              color="text.mist"
              fontFamily="mono"
              whiteSpace="nowrap"
            >
              {formatLabel(lane.time)}
            </Text>
          </Center>
        );
      })}
    </Box>
  );
}
