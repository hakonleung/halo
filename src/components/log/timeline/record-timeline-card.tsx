'use client';

import { Text, HStack, Card, Badge, Box } from '@chakra-ui/react';
import { useViewportPosition } from '@/hooks/use-viewport-position';
import type { BehaviorRecordWithDefinition } from '@/types/behavior-client';
import type React from 'react';

interface RecordTimelineCardProps {
  record: BehaviorRecordWithDefinition;
  onClick?: () => void;
  width: number;
  height: number;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export function RecordTimelineCard({
  record,
  onClick,
  width,
  height,
  scrollContainerRef,
}: RecordTimelineCardProps) {
  const { translateX, contentRef } = useViewportPosition(scrollContainerRef);
  const definition = record.behaviorDefinitions;
  const metadataEntries = Object.entries(record.metadata || {});

  return (
    <Card.Root
      size="sm"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      borderColor="rgba(0, 255, 65, 0.3)"
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
            {definition.icon && <Text fontSize="sm">{definition.icon}</Text>}
            <Text fontSize="xs" fontWeight="bold" color="text.neon" fontFamily="mono" lineClamp={1}>
              {definition.name}
            </Text>
            <Badge colorScheme="success" size="sm">
              {definition.category}
            </Badge>
          </HStack>
          {metadataEntries.length > 0 && (
            <Text
              fontSize="2xs"
              color="text.mist"
              fontFamily="mono"
              lineClamp={1}
              textAlign="center"
            >
              {metadataEntries
                .slice(0, 2)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')}
            </Text>
          )}
        </Box>
      </Card.Body>
    </Card.Root>
  );
}
