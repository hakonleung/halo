'use client';

import { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Box,
  Checkbox,
  Collapsible,
  Button,
} from '@chakra-ui/react';
import { LuTrash2, LuSettings, LuPlus } from 'react-icons/lu';
import type { MetadataField } from '@/client/types/behavior-client';
import { InputField } from '../fields/input-field';
import { SelectField } from '../fields/select-field';

type SimpleFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'time'
  | 'datetime'
  | 'rating'
  | 'currency';

const fieldTypeOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Textarea', value: 'textarea' },
  { label: 'Number', value: 'number' },
  { label: 'Currency', value: 'currency' },
  { label: 'Select', value: 'select' },
  { label: 'Multi-Select', value: 'multiselect' },
  { label: 'Date', value: 'date' },
  { label: 'Time', value: 'time' },
  { label: 'Date & Time', value: 'datetime' },
  { label: 'Rating', value: 'rating' },
];

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
    case 'multiselect':
      return { ...base, type, config: { options: [] } };
    case 'date':
    case 'time':
    case 'datetime':
      return { ...base, type, config: {} };
    case 'rating':
      return { ...base, type, config: { maxRating: 5 } };
  }
}

export function MetadataFieldEditor({
  field,
  isConfigExpanded,
  onToggleConfig,
  onChange,
  onRemove,
}: {
  field: MetadataField;
  isConfigExpanded: boolean;
  onToggleConfig: () => void;
  onChange: (field: MetadataField) => void;
  onRemove: () => void;
}) {
  const updateConfig = (key: string, value: unknown) => {
    const newConfig = { ...field.config, [key]: value };
    if (value === '' || value === undefined) {
      // FIXME
      // @ts-expect-error - key is a valid key in newConfig
      delete newConfig[key];
    }
    // FIXME
    // @ts-expect-error - newConfig is a valid config for MetadataField
    onChange({ ...field, config: newConfig });
  };

  const handleTypeChange = (type: SimpleFieldType) => {
    const newField = createDefaultField(type);
    onChange({ ...newField, name: field.name, key: field.key, required: field.required });
  };

  const handleNameChange = (name: string) => {
    onChange({ ...field, name, key: generateKey(name) });
  };

  const hasPlaceholder = [
    'text',
    'textarea',
    'number',
    'currency',
    'select',
    'multiselect',
  ].includes(field.type);

  return (
    <Box p={2} borderWidth="1px" borderColor="rgba(0, 255, 65, 0.2)" borderRadius="4px">
      <VStack gap={2} align="stretch">
        {/* Row 1: Name, Type, Actions */}
        <HStack gap={2}>
          <InputField
            label=""
            value={field.name}
            onChange={(value) => handleNameChange(typeof value === 'string' ? value : '')}
            type="text"
            placeholder="Field name"
            flex={1}
          />
          <SelectField
            label=""
            value={field.type}
            onChange={(value) => {
              const stringValue = typeof value === 'string' ? value : '';
              // FIXME
              // @ts-expect-error - stringValue is a valid SimpleFieldType
              handleTypeChange(stringValue);
            }}
            options={fieldTypeOptions}
            flex="120px"
            transformValue={(value) => value}
          />
          <IconButton
            variant="ghost"
            onClick={onToggleConfig}
            aria-label="Config"
            color={isConfigExpanded ? 'brand.matrix' : 'text.mist'}
          >
            <LuSettings />
          </IconButton>
          <IconButton variant="ghost" colorScheme="red" onClick={onRemove} aria-label="Remove">
            <LuTrash2 />
          </IconButton>
        </HStack>

        {/* Row 2: Required + type-specific required config */}
        <HStack gap={2}>
          <Checkbox.Root
            checked={field.required}
            onCheckedChange={(e) => {
              onChange({ ...field, required: !!e.checked });
            }}
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
            <InputField
              label=""
              value={field.config.maxRating ?? 5}
              onChange={(value) => updateConfig('maxRating', typeof value === 'number' ? value : 5)}
              type="number"
              placeholder="Max *"
              min="1"
              flex="120px"
            />
          )}
          {field.type === 'currency' && (
            <InputField
              label=""
              value={field.config.currency ?? 'CNY'}
              onChange={(value) =>
                updateConfig('currency', typeof value === 'string' ? value : 'CNY')
              }
              type="text"
              placeholder="Code *"
              flex="100px"
            />
          )}
          {field.type === 'number' && (
            <InputField
              label=""
              value={field.config.unit ?? ''}
              onChange={(value) =>
                updateConfig('unit', typeof value === 'string' ? value : undefined)
              }
              type="text"
              placeholder="Unit"
              flex="100px"
            />
          )}
        </HStack>
        {/* Select Options Editor */}
        {(field.type === 'select' || field.type === 'multiselect') && (
          <SelectOptionsEditor
            options={field.config.options}
            onChange={(options) => updateConfig('options', options)}
          />
        )}
        {/* Expandable Advanced Config */}
        <Collapsible.Root open={isConfigExpanded}>
          <Collapsible.Content>
            <Box pt={2} mt={2} borderTopWidth="1px" borderColor="rgba(0, 255, 65, 0.1)">
              <VStack gap={2} align="stretch">
                <Text fontSize="xs" color="text.mist" fontFamily="mono">
                  ADVANCED CONFIG
                </Text>
                {hasPlaceholder && (
                  <InputField
                    label="Placeholder"
                    value={('placeholder' in field.config ? field.config.placeholder : '') || ''}
                    onChange={(value) =>
                      updateConfig('placeholder', typeof value === 'string' ? value : '')
                    }
                    type="text"
                    flex={1}
                  />
                )}
                {field.type === 'number' && (
                  <HStack gap={2}>
                    <InputField
                      label="Min"
                      value={field.config.min ?? ''}
                      onChange={(value) =>
                        updateConfig('min', typeof value === 'number' ? value : undefined)
                      }
                      type="number"
                      flex={1}
                    />
                    <InputField
                      label="Max"
                      value={field.config.max ?? ''}
                      onChange={(value) =>
                        updateConfig('max', typeof value === 'number' ? value : undefined)
                      }
                      type="number"
                      flex={1}
                    />
                    <InputField
                      label="Decimals"
                      value={field.config.decimals ?? ''}
                      onChange={(value) =>
                        updateConfig('decimals', typeof value === 'number' ? value : undefined)
                      }
                      type="number"
                      flex={1}
                    />
                  </HStack>
                )}
                {(field.type === 'text' || field.type === 'textarea') && (
                  <InputField
                    label="Default"
                    value={field.config.defaultValue ?? ''}
                    onChange={(value) =>
                      updateConfig('defaultValue', typeof value === 'string' ? value : undefined)
                    }
                    type="text"
                    flex={1}
                  />
                )}
                {(field.type === 'number' || field.type === 'currency') && (
                  <InputField
                    label="Default"
                    value={field.config.defaultValue ?? ''}
                    onChange={(value) =>
                      updateConfig('defaultValue', typeof value === 'number' ? value : undefined)
                    }
                    type="number"
                    flex={1}
                  />
                )}
                {field.type === 'rating' && (
                  <InputField
                    label={`Default (1-${field.config.maxRating})`}
                    value={field.config.defaultValue ?? ''}
                    onChange={(value) =>
                      updateConfig('defaultValue', typeof value === 'number' ? value : undefined)
                    }
                    type="number"
                    flex={1}
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
        <HStack key={opt.value} gap={2}>
          <Input variant="outline" value={opt.label} readOnly flex={1} />
          <IconButton
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
        <InputField
          label=""
          value={newOption}
          onChange={(value) => setNewOption(typeof value === 'string' ? value : '')}
          type="text"
          placeholder="New option"
          flex={1}
          onKeyDown={handleKeyDown}
        />
        <Button variant="ghost" onClick={handleAdd} disabled={!newOption.trim()}>
          <LuPlus />
        </Button>
      </HStack>
    </VStack>
  );
}
