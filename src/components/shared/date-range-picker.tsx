'use client';

import { HStack, Box } from '@chakra-ui/react';
import { DatePicker } from '@/components/ui/date-picker';
import type { TimeRange } from '@/types/dashboard-client';
import { parseDate, type DatePickerValueChangeDetails } from '@ark-ui/react';

interface DateRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  if (value.type !== 'custom') {
    return null;
  }

  const handleStartChange = (details: DatePickerValueChangeDetails) => {
    const firstValue = details.value[0];
    if (firstValue) {
      onChange({
        ...value,
        type: 'custom',
        start: firstValue.toString(),
      });
    }
  };

  const handleEndChange = (details: DatePickerValueChangeDetails) => {
    const firstValue = details.value[0];
    if (firstValue) {
      onChange({
        ...value,
        type: 'custom',
        end: firstValue.toString(),
      });
    }
  };

  return (
    <HStack gap={2} align="center">
      <DatePicker
        placeholder="Start date"
        value={value.start ? [parseDate(value.start)] : []}
        onValueChange={handleStartChange}
      />
      <Box color="text.mist" fontFamily="mono" fontSize="sm">
        to
      </Box>
      <DatePicker
        placeholder="End date"
        value={value.end ? [parseDate(value.end)] : []}
        onValueChange={handleEndChange}
      />
    </HStack>
  );
}
