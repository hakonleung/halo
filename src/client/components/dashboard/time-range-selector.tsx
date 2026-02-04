'use client';

import { Box, Select, Portal, createListCollection } from '@chakra-ui/react';
import { CaretDown, Calendar } from 'phosphor-react';

import { TimeRangePreset } from '@/client/types/dashboard-client';

import type { TimeRange } from '@/client/types/dashboard-client';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  disabled?: boolean;
}

const PRESET_OPTIONS: Array<{ value: TimeRangePreset; label: string }> = [
  { value: TimeRangePreset.Today, label: 'Today' },
  { value: TimeRangePreset.Last7Days, label: 'Last 7 Days' },
  { value: TimeRangePreset.Last30Days, label: 'Last 30 Days' },
  { value: TimeRangePreset.Last90Days, label: 'Last 90 Days' },
];

function getDisplayLabel(range: TimeRange): string {
  if (range.type === 'preset') {
    return PRESET_OPTIONS.find((o) => o.value === range.value)?.label || 'Select Time';
  }
  return `${range.start} ~ ${range.end}`;
}

const optionsCollection = createListCollection({ items: PRESET_OPTIONS });

function isValidTimeRangePreset(value: string): value is TimeRangePreset {
  return (
    value === TimeRangePreset.Today ||
    value === TimeRangePreset.Last7Days ||
    value === TimeRangePreset.Last30Days ||
    value === TimeRangePreset.Last90Days
  );
}

export function TimeRangeSelector({ value, onChange, disabled }: TimeRangeSelectorProps) {
  const currentValue = value.type === 'preset' ? value.value : undefined;

  return (
    <Select.Root
      collection={optionsCollection}
      value={currentValue ? [currentValue] : []}
      onValueChange={(e) => {
        const selectedValue = e.value[0];
        if (selectedValue && isValidTimeRangePreset(selectedValue)) {
          onChange({ type: 'preset', value: selectedValue });
        }
      }}
      disabled={disabled}
    >
      <Select.Trigger
        borderColor="brand.matrix"
        color="text.neon"
        _hover={{
          bg: 'rgba(0, 255, 65, 0.1)',
          borderColor: 'brand.matrix',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Calendar size={16} />
          <Select.ValueText>
            {currentValue ? getDisplayLabel(value) : 'Select Time'}
          </Select.ValueText>
          <CaretDown size={14} />
        </Box>
      </Select.Trigger>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {PRESET_OPTIONS.map((option) => (
              <Select.Item key={option.value} item={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
}
