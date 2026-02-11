'use client';

import { Card, Center } from '@chakra-ui/react';

import { useViewportPosition } from '@/client/hooks/use-viewport-position';

import type React from 'react';

interface FilterTimelineCardProps {
  children: React.ReactNode;
  width: number;
  height: number;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export function FilterTimelineCard({
  children,
  width,
  height,
  scrollContainerRef,
}: FilterTimelineCardProps) {
  const { translateX, contentRef } = useViewportPosition(scrollContainerRef);

  return (
    <Card.Root w={`${width}px`} h={`${height}px`} borderColor="matrix/20">
      <Card.Body h="100%" display="flex" alignItems="center" justifyContent="center" p={2}>
        <Center
          ref={contentRef}
          maxW="100%"
          transform={`translateX(${translateX}px)`}
          transition="transform 0.1s ease-out"
        >
          {children}
        </Center>
      </Card.Body>
    </Card.Root>
  );
}
