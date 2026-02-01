'use client';

import { HStack, Box, Input, Select, Portal, createListCollection } from '@chakra-ui/react';

export type FilterType = 'select' | 'search' | 'datepicker';

export interface FilterConfig {
  key: string;
  type: FilterType;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  value?: string;
  minW?: string;
  maxW?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  onChange: (key: string, value: string) => void;
  compact?: boolean;
}

export function FilterBar({ filters, onChange, compact = true }: FilterBarProps) {
  const gap = compact ? 1 : 4;

  return (
    <Box>
      <HStack gap={gap} wrap="wrap">
        {filters.map((filter) => {
          if (filter.type === 'select' && filter.options) {
            const collection = createListCollection({
              items: filter.options,
            });

            return (
              <Box key={filter.key} minW={filter.minW || '100px'} maxW={filter.maxW}>
                <Select.Root
                  collection={collection}
                  value={[filter.value || 'all']}
                  onValueChange={(e) => {
                    const value = e.value[0];
                    if (typeof value === 'string') {
                      onChange(filter.key, value);
                    }
                  }}
                  size="xs"
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder={filter.placeholder || 'Select...'} />
                  </Select.Trigger>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                        {collection.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Box>
            );
          }

          if (filter.type === 'search') {
            return (
              <Input
                key={filter.key}
                placeholder={filter.placeholder || 'Search...'}
                value={filter.value || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                size="xs"
                maxW={filter.maxW || '150px'}
                minW={filter.minW}
              />
            );
          }

          if (filter.type === 'datepicker') {
            return (
              <Input
                key={filter.key}
                type="date"
                value={filter.value || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                size="xs"
                maxW={filter.maxW || '120px'}
                minW={filter.minW}
              />
            );
          }

          return null;
        })}
      </HStack>
    </Box>
  );
}
