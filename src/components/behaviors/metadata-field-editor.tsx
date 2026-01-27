'use client';

import { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Input,
  Field,
  createListCollection,
  Select,
  IconButton,
  Box,
  Checkbox,
  Collapsible,
  Button,
} from '@chakra-ui/react';
import { LuTrash2, LuSettings, LuPlus } from 'react-icons/lu';
import type { MetadataField } from '@/types/behavior-client';

type SimpleFieldType = 'text' | 'textarea' | 'number' | 'select' | 'rating' | 'currency';

const fieldTypeOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Textarea', value: 'textarea' },
  { label: 'Number', value: 'number' },
  { label: 'Currency', value: 'currency' },
  { label: 'Select', value: 'select' },
  { label: 'Rating', value: 'rating' },
];

const fieldTypeCollection = createListCollection({ items: fieldTypeOptions });

function generateKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function createDefaultField(type: SimpleFieldType): MetadataField {
  const base = { name: '', key: '', required: false };
  switch (type) {
    case 'text':
    case 'textarea':
      return { ...base, type, config: {} };
    case 'number':
      return { ...base, type, config: {} };
    case 'currency':
      return { ...base, type, config: { currency: 'CNY' } };
    case 'select':
      return { ...base, type, config: { options: [] } };
    case 'rating':
      return { ...base, type, config: { maxRating: 5 } };
  }
}

interface Props {
  field: MetadataField;
  isConfigExpanded: boolean;
  onToggleConfig: () => void;
  onChange: (field: MetadataField) => void;
  onRemove: () => void;
}

export function MetadataFieldEditor({
  field,
  isConfigExpanded,
  onToggleConfig,
  onChange,
  onRemove,
}: Props) {
  const updateConfig = (key: string, value: unknown) => {
    const newConfig = { ...field.config, [key]: value };
    if (value === '' || value === undefined) delete (newConfig as Record<string, unknown>)[key];
    onChange({ ...field, config: newConfig } as MetadataField);
  };

  const handleTypeChange = (type: SimpleFieldType) => {
    const newField = createDefaultField(type);
    onChange({ ...newField, name: field.name, key: field.key, required: field.required });
  };

  const handleNameChange = (name: string) => {
    onChange({ ...field, name, key: generateKey(name) } as MetadataField);
  };

  const hasPlaceholder = ['text', 'textarea', 'number', 'currency', 'select'].includes(field.type);

  return (
    <Box p={3} borderWidth="1px" borderColor="rgba(0, 255, 65, 0.2)" borderRadius="md">
      <VStack gap={3} align="stretch">
        {/* Row 1: Name, Type, Actions */}
        <HStack gap={2}>
          <Field.Root flex={1}>
            <Input
              size="sm"
              variant="outline"
              placeholder="Field name"
              value={field.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </Field.Root>
          <Select.Root
            collection={fieldTypeCollection}
            value={[field.type]}
            onValueChange={(e) => handleTypeChange(e.value[0] as SimpleFieldType)}
            size="sm"
            width="120px"
          >
            <Select.Trigger>
              <Select.ValueText />
            </Select.Trigger>
            <Select.Content bg="bg.carbon" borderColor="brand.matrix">
              {fieldTypeCollection.items.map((item) => (
                <Select.Item item={item} key={item.value} _hover={{ bg: 'rgba(0, 255, 65, 0.1)' }}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <IconButton
            size="xs"
            variant="ghost"
            onClick={onToggleConfig}
            aria-label="Config"
            color={isConfigExpanded ? 'brand.matrix' : 'text.mist'}
          >
            <LuSettings />
          </IconButton>
          <IconButton
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={onRemove}
            aria-label="Remove"
          >
            <LuTrash2 />
          </IconButton>
        </HStack>

        {/* Row 2: Required + type-specific required config */}
        <HStack gap={4}>
          <Checkbox.Root
            checked={field.required}
            onCheckedChange={(e) => onChange({ ...field, required: !!e.checked } as MetadataField)}
            size="sm"
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>
              <Text fontSize="xs" color="text.mist">
                Required
              </Text>
            </Checkbox.Label>
          </Checkbox.Root>

          {field.type === 'rating' && (
            <Field.Root width="120px">
              <Input
                size="sm"
                variant="outline"
                type="number"
                placeholder="Max *"
                value={field.config.maxRating}
                onChange={(e) => updateConfig('maxRating', parseInt(e.target.value) || 5)}
                min={1}
                max={10}
              />
            </Field.Root>
          )}
          {field.type === 'currency' && (
            <Field.Root width="100px">
              <Input
                size="sm"
                variant="outline"
                placeholder="Code *"
                value={field.config.currency}
                onChange={(e) => updateConfig('currency', e.target.value)}
              />
            </Field.Root>
          )}
          {field.type === 'number' && (
            <Field.Root width="100px">
              <Input
                size="sm"
                variant="outline"
                placeholder="Unit"
                value={field.config.unit ?? ''}
                onChange={(e) => updateConfig('unit', e.target.value || undefined)}
              />
            </Field.Root>
          )}
        </HStack>

        {/* Select Options Editor */}
        {field.type === 'select' && (
          <SelectOptionsEditor
            options={field.config.options}
            onChange={(options) => updateConfig('options', options)}
          />
        )}

        {/* Expandable Advanced Config */}
        <Collapsible.Root open={isConfigExpanded}>
          <Collapsible.Content>
            <Box pt={3} mt={2} borderTopWidth="1px" borderColor="rgba(0, 255, 65, 0.1)">
              <VStack gap={3} align="stretch">
                <Text fontSize="xs" color="text.mist" fontFamily="mono">
                  ADVANCED CONFIG
                </Text>

                {hasPlaceholder && (
                  <ConfigInput
                    label="Placeholder"
                    value={('placeholder' in field.config ? field.config.placeholder : '') || ''}
                    onChange={(v) => updateConfig('placeholder', v)}
                  />
                )}

                {field.type === 'number' && (
                  <HStack gap={3}>
                    <ConfigInput
                      label="Min"
                      type="number"
                      value={field.config.min ?? ''}
                      onChange={(v) => updateConfig('min', v ? parseFloat(v) : undefined)}
                    />
                    <ConfigInput
                      label="Max"
                      type="number"
                      value={field.config.max ?? ''}
                      onChange={(v) => updateConfig('max', v ? parseFloat(v) : undefined)}
                    />
                    <ConfigInput
                      label="Decimals"
                      type="number"
                      value={field.config.decimals ?? ''}
                      onChange={(v) => updateConfig('decimals', v ? parseInt(v) : undefined)}
                    />
                  </HStack>
                )}

                {(field.type === 'text' || field.type === 'textarea') && (
                  <ConfigInput
                    label="Default"
                    value={field.config.defaultValue ?? ''}
                    onChange={(v) => updateConfig('defaultValue', v || undefined)}
                  />
                )}

                {(field.type === 'number' || field.type === 'currency') && (
                  <ConfigInput
                    label="Default"
                    type="number"
                    value={field.config.defaultValue ?? ''}
                    onChange={(v) => updateConfig('defaultValue', v ? parseFloat(v) : undefined)}
                  />
                )}

                {field.type === 'rating' && (
                  <ConfigInput
                    label={`Default (1-${field.config.maxRating})`}
                    type="number"
                    value={field.config.defaultValue ?? ''}
                    onChange={(v) => updateConfig('defaultValue', v ? parseInt(v) : undefined)}
                  />
                )}
              </VStack>
            </Box>
          </Collapsible.Content>
        </Collapsible.Root>
      </VStack>
    </Box>
  );
}

function SelectOptionsEditor({
  options,
  onChange,
}: {
  options: { label: string; value: string }[];
  onChange: (options: { label: string; value: string }[]) => void;
}) {
  const [newOption, setNewOption] = useState('');

  const handleAdd = () => {
    if (!newOption.trim()) return;
    const label = newOption.trim();
    onChange([...options, { label, value: generateKey(label) }]);
    setNewOption('');
  };

  const handleRemove = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <VStack gap={2} align="stretch">
      <Text fontSize="xs" color="text.mist">
        Options{' '}
        {options.length === 0 && (
          <Text as="span" color="red.400">
            *
          </Text>
        )}
      </Text>
      {options.map((opt, idx) => (
        <HStack key={idx} gap={2}>
          <Input size="sm" variant="outline" value={opt.label} readOnly flex={1} />
          <IconButton
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={() => handleRemove(idx)}
            aria-label="Remove option"
          >
            <LuTrash2 />
          </IconButton>
        </HStack>
      ))}
      <HStack gap={2}>
        <Input
          size="sm"
          variant="outline"
          placeholder="New option"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={handleKeyDown}
          flex={1}
        />
        <Button size="xs" variant="ghost" onClick={handleAdd} disabled={!newOption.trim()}>
          <LuPlus />
        </Button>
      </HStack>
    </VStack>
  );
}

function ConfigInput({
  label,
  value,
  type = 'text',
  onChange,
}: {
  label: string;
  value: string | number;
  type?: 'text' | 'number';
  onChange: (v: string) => void;
}) {
  return (
    <Field.Root flex={1}>
      <Field.Label fontSize="xs" color="text.mist">
        {label}
      </Field.Label>
      <Input
        size="sm"
        variant="outline"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field.Root>
  );
}
