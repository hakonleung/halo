'use client';

import { Text, HStack, Card, Badge, Box } from '@chakra-ui/react';
import { useViewportPosition } from '@/hooks/use-viewport-position';
import type { Goal } from '@/types/goal-client';
import type React from 'react';

interface GoalTimelineCardProps {
  goal: Goal;
  progress?: { current: number; target: number; progress: number; isCompleted: boolean };
  onClick?: () => void;
  width: number;
  height: number;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export function GoalTimelineCard({
  goal,
  progress,
  onClick,
  width,
  height,
  scrollContainerRef,
}: GoalTimelineCardProps) {
  const { translateX, contentRef } = useViewportPosition(scrollContainerRef);

  // Set background color based on status
  const bgColor =
    goal.status === 'active'
      ? 'rgba(0, 255, 65, 0.1)'
      : goal.status === 'abandoned'
        ? 'rgba(136, 136, 136, 0.1)'
        : 'rgba(0, 255, 65, 0.05)'; // completed

  return (
    <Card.Root
      size="sm"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      borderColor={
        goal.status === 'active'
          ? 'rgba(0, 255, 65, 0.3)'
          : goal.status === 'completed'
            ? 'rgba(0, 255, 65, 0.2)'
            : 'rgba(136, 136, 136, 0.3)'
      }
      bg={bgColor}
      w={`${width}px`}
      h={`${height}px`}
      _hover={{
        borderColor: 'brand.matrix',
        boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)',
      }}
    >
      <Card.Body h="100%" display="flex" alignItems="center" justifyContent="center">
        <Box
          ref={contentRef}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          gap={1}
          maxW="100%"
          w="auto"
          alignItems="center"
          transform={`translateX(${translateX}px)`}
          transition="transform 0.1s ease-out"
        >
          <HStack justify="center" align="center" gap={1}>
            <Text fontSize="xs" fontWeight="bold" color="text.neon" fontFamily="mono" lineClamp={1}>
              {goal.name}
            </Text>
            <Badge colorScheme="success" size="sm">
              {goal.category}
            </Badge>
          </HStack>
          <Text fontSize="2xs" color="text.mist" fontFamily="mono">
            {progress?.current ?? 0}/{progress?.target ?? 0}
          </Text>
        </Box>
      </Card.Body>
    </Card.Root>
  );
}
