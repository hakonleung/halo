'use client';

import { SimpleGrid, VStack, Card, Text, Skeleton } from '@chakra-ui/react';
import type { BehaviorRecordWithDefinition } from '@/types/behavior-client';
import { RecordCard } from './record-card';

interface RecordListProps {
  records: BehaviorRecordWithDefinition[];
  isLoading?: boolean;
}

export function RecordList({ records, isLoading }: RecordListProps) {
  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height="200px" borderRadius="4px" />
        ))}
      </SimpleGrid>
    );
  }

  if (records.length === 0) {
    return (
      <Card.Root size="lg" borderStyle="dashed">
        <Card.Body textAlign="center">
          <VStack gap={2}>
            <Text color="text.mist" fontFamily="mono" fontSize="lg">
              No Records
            </Text>
            <Text color="brand.matrix" fontFamily="mono" fontSize="sm">
              Create Your First Record
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
      {records.map((record) => (
        <RecordCard
          key={record.id}
          record={record}
          onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.set('record', record.id);
            window.history.pushState({}, '', url.toString());
            window.dispatchEvent(new Event('popstate'));
          }}
        />
      ))}
    </SimpleGrid>
  );
}
