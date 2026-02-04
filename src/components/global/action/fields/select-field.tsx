'use client';

import { useMemo } from 'react';
import { Select, Field, Portal, createListCollection } from '@chakra-ui/react';
import type { MetadataValue } from '@/types/behavior-client';

interface SelectOption {
  label: string;
  value: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  multiple = false,
  placeholder = 'Choose an option...',
  required,
  invalid,
  transformValue,
  flex,
  getItemProps,
  disabled,
}: {
  label: string;
  value: MetadataValue;
  onChange: (value: MetadataValue) => void;
  options: SelectOption[];
  multiple?: boolean;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
  transformValue?: (value: string) => MetadataValue;
  flex?: number | string;
  getItemProps?: (item: SelectOption) => Record<string, unknown>;
  disabled?: boolean;
}) {
  const collection = useMemo(
    () =>
      createListCollection({
        items: options,
      }),
    [options],
  );

  const selectedValue = useMemo(() => {
    if (multiple) {
      if (Array.isArray(value)) return value.map(String);
      return [];
    }
    if (value !== undefined && value !== null) return [String(value)];
    return [];
  }, [value, multiple]);

  return (
    <Field.Root required={required} invalid={invalid} flex={flex}>
      {label && <Field.Label color="text.mist">{label}</Field.Label>}
      <Select.Root
        collection={collection}
        value={selectedValue}
        onValueChange={(e) => {
          if (multiple) {
            onChange(e.value);
          } else {
            const selectedValue = e.value[0] || null;
            if (transformValue && selectedValue) {
              onChange(transformValue(selectedValue));
            } else {
              onChange(selectedValue);
            }
          }
        }}
        multiple={multiple}
        disabled={disabled}
      >
        <Select.HiddenSelect />
        <Select.Trigger>
          <Select.ValueText placeholder={placeholder} />
        </Select.Trigger>
        <Portal>
          <Select.Positioner>
            <Select.Content bg="bg.carbon" borderColor="brand.matrix" zIndex="popover">
              {collection.items.map((item) => {
                const itemProps = getItemProps ? getItemProps(item) : {};
                return (
                  <Select.Item
                    item={item}
                    key={item.value}
                    _hover={{ bg: 'rgba(0, 255, 65, 0.1)' }}
                    {...itemProps}
                  >
                    {item.label}
                  </Select.Item>
                );
              })}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Field.Root>
  );
}
