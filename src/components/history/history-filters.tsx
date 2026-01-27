'use client';

import { Box, HStack, Input, createListCollection, Select } from '@chakra-ui/react';
import type { HistoryListRequest } from '@/types/history-client';
import { HistoryItemType } from '@/types/history-server';

interface HistoryFiltersProps {
  filters: HistoryListRequest;
  onFilterChange: (newFilters: Partial<HistoryListRequest>) => void;
}

const typeOptions = createListCollection({
  items: [
    { label: 'All Types', value: 'all' },
    { label: 'Behaviors', value: 'behavior' },
    { label: 'Goals', value: 'goal' },
    { label: 'Notes', value: 'note' },
  ],
});

export function HistoryFilters({ filters, onFilterChange }: HistoryFiltersProps) {
  return (
    <Box bg="bg.carbon" p={4} border="1px solid" borderColor="border.subtle" borderRadius="4px">
      <HStack gap={4} wrap="wrap">
        <Box minW="200px">
          <Select.Root
            collection={typeOptions}
            value={[filters.type || 'all']}
            onValueChange={(e) => {
              const value = e.value[0];
              if (value === 'all') {
                onFilterChange({ type: 'all' });
              } else if (value === 'behavior') {
                onFilterChange({ type: HistoryItemType.Behavior });
              } else if (value === 'goal') {
                onFilterChange({ type: HistoryItemType.Goal });
              } else if (value === 'note') {
                onFilterChange({ type: HistoryItemType.Note });
              }
            }}
          >
            <Select.Trigger>
              <Select.ValueText placeholder="Select Type" />
            </Select.Trigger>
            <Select.Content bg="bg.carbon" borderColor="brand.matrix">
              {typeOptions.items.map((item) => (
                <Select.Item item={item} key={item.value} _hover={{ bg: 'rgba(0, 255, 65, 0.1)' }}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>

        <Input
          placeholder="Search records..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          maxW="300px"
        />

        <Input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => onFilterChange({ startDate: e.target.value })}
          maxW="180px"
        />

        <Input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => onFilterChange({ endDate: e.target.value })}
          maxW="180px"
        />
      </HStack>
    </Box>
  );
}
