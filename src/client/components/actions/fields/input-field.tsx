'use client';

import { Input, Field } from '@chakra-ui/react';
import type { MetadataValue } from '@/client/types/behavior-client';

export function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  invalid,
  min,
  step,
  flex,
  onKeyDown,
}: {
  label: string;
  value: MetadataValue;
  onChange: (value: MetadataValue) => void;
  type?: 'text' | 'number' | 'currency' | 'date';
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
  min?: string;
  step?: number;
  flex?: number | string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  const isNumber = type === 'number' || type === 'currency';
  const isDate = type === 'date';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isNumber) {
      const numValue = parseFloat(e.target.value);
      onChange(isNaN(numValue) ? 0 : numValue);
    } else {
      onChange(e.target.value);
    }
  };

  const displayValue = value !== undefined && value !== null ? String(value) : '';

  const inputType = isNumber ? 'number' : isDate ? 'date' : 'text';

  return (
    <Field.Root required={required} invalid={invalid} flex={flex}>
      {label && <Field.Label color="text.mist">{label}</Field.Label>}
      <Input
        type={inputType}
        variant="outline"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        step={step}
        onKeyDown={onKeyDown}
      />
    </Field.Root>
  );
}
