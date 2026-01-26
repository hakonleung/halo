'use client';

import { Box, Button, Menu, Portal } from '@chakra-ui/react';
import { CaretDown, Calendar } from '@phosphor-icons/react';
import type { TimeRange, TimeRangePreset } from '@/types/dashboard-client';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  disabled?: boolean;
}

const PRESET_OPTIONS: Array<{ value: TimeRangePreset; label: string }> = [
  { value: 'today', label: '今日' },
  { value: '7d', label: '最近 7 天' },
  { value: '30d', label: '最近 30 天' },
  { value: '90d', label: '最近 90 天' },
];

function getDisplayLabel(range: TimeRange): string {
  if (range.type === 'preset') {
    return PRESET_OPTIONS.find(o => o.value === range.value)?.label || '选择时间';
  }
  return `${range.start} ~ ${range.end}`;
}

export function TimeRangeSelector({ value, onChange, disabled }: TimeRangeSelectorProps) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          borderColor="brand.matrix"
          color="text.neon"
          _hover={{
            bg: 'rgba(0, 255, 65, 0.1)',
            borderColor: 'brand.matrix',
          }}
        >
          <Calendar size={16} />
          <Box as="span" ml={2} mr={1}>
            {getDisplayLabel(value)}
          </Box>
          <CaretDown size={14} />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content
            bg="bg.carbon"
            borderColor="brand.matrix"
            borderWidth="1px"
            boxShadow="0 0 20px rgba(0, 255, 65, 0.2)"
          >
            {PRESET_OPTIONS.map(option => (
              <Menu.Item
                key={option.value}
                value={option.value}
                onClick={() => onChange({ type: 'preset', value: option.value })}
                color={value.type === 'preset' && value.value === option.value ? 'brand.matrix' : 'text.neon'}
                bg="transparent"
                _hover={{ bg: 'rgba(0, 255, 65, 0.1)' }}
              >
                {option.label}
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
