'use client';

import { Box, Input } from '@chakra-ui/react';
import type { TimeRange } from '@/types/dashboard-client';

interface DateRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (value.type === 'custom') {
      onChange({
        type: 'custom',
        start: e.target.value,
        end: value.end,
      });
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (value.type === 'custom') {
      onChange({
        type: 'custom',
        start: value.start,
        end: e.target.value,
      });
    }
  };

  if (value.type !== 'custom') {
    return null;
  }

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Input type="date" value={value.start} onChange={handleStartChange} size="sm" maxW="150px" />
      <Box color="text.mist" fontFamily="mono">
        to
      </Box>
      <Input type="date" value={value.end} onChange={handleEndChange} size="sm" maxW="150px" />
    </Box>
  );
}
