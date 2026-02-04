'use client';

import { Text, HStack, VStack, Card, Badge, Box } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import type { BehaviorRecordWithDefinition } from '@/types/behavior-client';

interface RecordCardProps {
  record: BehaviorRecordWithDefinition;
  onClick?: () => void;
}

export function RecordCard({ record, onClick }: RecordCardProps) {
  const definition = record.behaviorDefinitions;
  const metadataEntries = Object.entries(record.metadata || {});

  // Safely format date
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Unknown time';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card.Root
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      borderColor="rgba(0, 255, 65, 0.3)"
      _hover={{
        borderColor: 'rgba(0, 255, 65, 0.5)',
        boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)',
      }}
    >
      <Card.Body>
        <HStack justify="space-between" align="flex-start" mb={3}>
          <HStack gap={2} flex={1}>
            {definition.icon && <Text fontSize="24px">{definition.icon}</Text>}
            <VStack align="flex-start" gap={0} flex={1}>
              <Text fontSize="lg" fontWeight="bold" color="text.neon" fontFamily="mono">
                {definition.name}
              </Text>
              <Badge colorPalette="green" variant="outline" mt={1}>
                {definition.category}
              </Badge>
            </VStack>
          </HStack>
        </HStack>

        {metadataEntries.length > 0 && (
          <VStack align="flex-start" gap={1} mb={3}>
            {metadataEntries.slice(0, 3).map(([key, value]) => (
              <HStack key={key} gap={2} fontSize="xs" color="text.mist" fontFamily="mono">
                <Text fontWeight="bold">{key}:</Text>
                <Text>{String(value)}</Text>
              </HStack>
            ))}
            {metadataEntries.length > 3 && (
              <Text fontSize="xs" color="text.dim" fontFamily="mono">
                +{metadataEntries.length - 3} more
              </Text>
            )}
          </VStack>
        )}

        {record.note && (
          <Box
            p={2}
            bg="bg.dark"
            borderRadius="4px"
            mb={3}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            <Text fontSize="xs" color="text.mist">
              {record.note}
            </Text>
          </Box>
        )}

        <HStack justify="space-between" fontSize="xs" color="text.dim" fontFamily="mono">
          <Text>{formatDate(record.recordedAt)}</Text>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
