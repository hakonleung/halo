'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Field,
  createListCollection,
  Select,
  Textarea,
  Box,
  Collapsible,
  Portal,
} from '@chakra-ui/react';
import {
  useBehaviorDefinitions,
  useCreateBehaviorDefinition,
} from '@/hooks/use-behavior-definitions';
import { useCreateBehaviorRecord, useUpdateBehaviorRecord } from '@/hooks/use-behavior-records';
import { DefinitionFormFields } from './definition-form-fields';
import { BehaviorCategory } from '@/types/behavior-server';
import type { MetadataField, MetadataValue, MetadataRecord } from '@/types/behavior-client';
import { useEditorModalStore } from '@/store/editor-modal-store';

const ADD_DEFINITION_VALUE = '__add_definition__';

interface RecordFormProps {
  initialData?: {
    id: string;
    definitionId: string;
    metadata: MetadataRecord;
    note?: string;
    recordedAt: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface MetadataSelectFieldProps {
  field: MetadataField & { type: 'select' | 'multiselect' };
  value: MetadataValue;
  onChange: (value: MetadataValue) => void;
}

function MetadataSelectField({ field, value, onChange }: MetadataSelectFieldProps) {
  const collection = useMemo(
    () =>
      createListCollection({
        items: field.config.options || [],
      }),
    [field.config.options],
  );

  const selectedValue = useMemo(() => {
    if (Array.isArray(value)) return value.map(String);
    if (value !== undefined && value !== null) return [String(value)];
    return [];
  }, [value]);

  return (
    <Select.Root
      collection={collection}
      value={selectedValue}
      onValueChange={(e) => {
        if (field.type === 'multiselect') {
          onChange(e.value);
        } else {
          onChange(e.value[0]);
        }
      }}
      multiple={field.type === 'multiselect'}
    >
      <Select.HiddenSelect />
      <Select.Trigger>
        <Select.ValueText
          placeholder={
            ('placeholder' in field.config && field.config.placeholder) || 'Choose an option...'
          }
        />
      </Select.Trigger>
      <Portal>
        <Select.Positioner>
          <Select.Content bg="bg.carbon" borderColor="brand.matrix" zIndex="popover">
            {collection.items.map((item) => (
              <Select.Item item={item} key={item.value} _hover={{ bg: 'rgba(0, 255, 65, 0.1)' }}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
}

export function RecordForm({ initialData, onSuccess, onCancel }: RecordFormProps) {
  const { definitions, isLoading: loadingDefs } = useBehaviorDefinitions();
  const { createDefinition, isLoading: savingDef } = useCreateBehaviorDefinition();
  const { createRecord, isLoading: savingRecord } = useCreateBehaviorRecord();
  const { updateRecord, isLoading: updatingRecord } = useUpdateBehaviorRecord();

  const isEditing = !!initialData;
  const isLoading = savingRecord || updatingRecord;

  const [selectedDefId, setSelectedDefId] = useState<string>(initialData?.definitionId || '');
  const [metadata, setMetadata] = useState<MetadataRecord>(initialData?.metadata || {});
  const [note, setNote] = useState(initialData?.note || '');
  const { openModal } = useEditorModalStore();

  // Inline definition creation state
  const [isAddingDefinition, setIsAddingDefinition] = useState(false);
  const [newDefName, setNewDefName] = useState('');
  const [newDefCategory, setNewDefCategory] = useState<BehaviorCategory>(BehaviorCategory.Other);
  const [newDefIcon, setNewDefIcon] = useState('');
  const [newDefMetadataSchema, setNewDefMetadataSchema] = useState<MetadataField[]>([]);

  const selectedDef = definitions.find((d) => d.id === selectedDefId);

  const definitionCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: '+ Add New Definition', value: ADD_DEFINITION_VALUE },
          ...definitions.map((d) => ({
            label: `${d.icon ? d.icon + ' ' : ''}${d.name}`,
            value: d.id,
          })),
        ],
      }),
    [definitions],
  );

  // Initialize metadata with default values when definition changes
  useEffect(() => {
    if (selectedDef) {
      // If editing and we have existing metadata, merge with defaults
      if (isEditing && initialData && Object.keys(metadata).length > 0) {
        // Keep existing metadata, only add defaults for new fields
        const mergedMetadata: MetadataRecord = { ...metadata };
        selectedDef.metadataSchema.forEach((field) => {
          if (!(field.key in mergedMetadata)) {
            mergedMetadata[field.key] = field.config.defaultValue ?? '';
          }
        });
        setMetadata(mergedMetadata);
      } else if (!isEditing) {
        // Create new metadata with defaults
        const initialMetadata: MetadataRecord = {};
        selectedDef.metadataSchema.forEach((field) => {
          initialMetadata[field.key] = field.config.defaultValue ?? '';
        });
        setMetadata(initialMetadata);
      }
    } else if (!isEditing) {
      setMetadata({});
    }
  }, [selectedDef, isEditing, initialData]);

  const handleSelectChange = (value: string) => {
    if (value === ADD_DEFINITION_VALUE) {
      setIsAddingDefinition(true);
      setSelectedDefId('');
    } else {
      setSelectedDefId(value);
      setIsAddingDefinition(false);
    }
  };

  const handleSaveDefinition = async () => {
    if (!newDefName.trim()) return;

    try {
      const newDef = await createDefinition({
        name: newDefName.trim(),
        category: newDefCategory,
        icon: newDefIcon.trim() || undefined,
        metadataSchema: newDefMetadataSchema.filter((f) => f.name && f.key),
      });

      // Auto-select the new definition
      setSelectedDefId(newDef.id);
      setIsAddingDefinition(false);

      // Reset form
      setNewDefName('');
      setNewDefCategory(BehaviorCategory.Other);
      setNewDefIcon('');
      setNewDefMetadataSchema([]);
    } catch {
      // Error handled by hook
    }
  };

  const handleCancelDefinition = () => {
    setIsAddingDefinition(false);
    setNewDefName('');
    setNewDefCategory(BehaviorCategory.Other);
    setNewDefIcon('');
    setNewDefMetadataSchema([]);
  };

  const handleSubmit = async () => {
    if (!selectedDefId) return;

    try {
      if (isEditing && initialData) {
        await updateRecord({
          id: initialData.id,
          updates: {
            definitionId: selectedDefId,
            metadata,
            note,
          },
        });
      } else {
        await createRecord({
          definitionId: selectedDefId,
          metadata,
          note,
        });
      }
      if (onSuccess) onSuccess();
    } catch {
      // Error handled by hook
    }
  };

  const handleMetadataChange = (key: string, value: MetadataValue) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const openEditor = (type: 'note' | 'metadata', fieldKey?: string) => {
    if (type === 'note') {
      openModal({
        value: note,
        onChange: setNote,
        onSave: (value) => {
          setNote(value);
        },
        placeholder: 'Add a comment...',
        title: 'NOTE EDITOR',
      });
    } else if (fieldKey) {
      const fieldValue = metadata[fieldKey];
      const field = selectedDef?.metadataSchema.find((f) => f.key === fieldKey);
      const config = field?.config;
      const placeholder =
        config && typeof config === 'object' && 'placeholder' in config
          ? typeof config.placeholder === 'string'
            ? config.placeholder
            : 'Click to edit in fullscreen editor...'
          : 'Start typing...';

      openModal({
        value: typeof fieldValue === 'string' ? fieldValue : '',
        onChange: (value) => {
          handleMetadataChange(fieldKey, value);
        },
        onSave: (value) => {
          handleMetadataChange(fieldKey, value);
        },
        placeholder,
        title: 'METADATA EDITOR',
      });
    }
  };

  return (
    <VStack gap={6} align="stretch" w="full">
      <Field.Root invalid={!selectedDefId && !isAddingDefinition}>
        <Field.Label color="text.mist" mb={2}>
          Select Behavior
        </Field.Label>
        <Select.Root
          collection={definitionCollection}
          value={isAddingDefinition ? [ADD_DEFINITION_VALUE] : [selectedDefId]}
          onValueChange={(e) => handleSelectChange(e.value[0])}
          disabled={loadingDefs}
        >
          <Select.HiddenSelect />
          <Select.Trigger>
            <Select.ValueText placeholder="Choose a behavior..." />
          </Select.Trigger>
          <Portal>
            <Select.Positioner>
              <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                {definitionCollection.items.map((item) => (
                  <Select.Item
                    item={item}
                    key={item.value}
                    _hover={{ bg: 'rgba(0, 255, 65, 0.1)' }}
                    color={item.value === ADD_DEFINITION_VALUE ? 'brand.matrix' : undefined}
                    fontWeight={item.value === ADD_DEFINITION_VALUE ? 'bold' : undefined}
                  >
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </Field.Root>

      {/* Inline Definition Creation Form */}
      <Collapsible.Root open={isAddingDefinition}>
        <Collapsible.Content>
          <Box
            p={4}
            borderWidth="1px"
            borderColor="brand.matrix"
            borderRadius="md"
            bg="rgba(0, 255, 65, 0.02)"
          >
            <DefinitionFormFields
              name={newDefName}
              category={newDefCategory}
              icon={newDefIcon}
              metadataSchema={newDefMetadataSchema}
              onNameChange={setNewDefName}
              onCategoryChange={setNewDefCategory}
              onIconChange={setNewDefIcon}
              onMetadataSchemaChange={setNewDefMetadataSchema}
              onSubmit={handleSaveDefinition}
              isLoading={savingDef}
              onCancel={handleCancelDefinition}
            />
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>

      {/* Record Metadata Form */}
      {selectedDef && (
        <VStack gap={4} align="stretch">
          <Text
            color="brand.matrix"
            fontSize="sm"
            fontFamily="mono"
            borderBottom="1px solid"
            borderColor="rgba(0, 255, 65, 0.2)"
            pb={2}
          >
            METADATA FIELDS
          </Text>

          {selectedDef.metadataSchema.map((field: MetadataField) => {
            return (
              <Field.Root key={field.key} required={field.required}>
                <Field.Label color="text.mist">{field.name}</Field.Label>
                {field.type === 'number' || field.type === 'currency' ? (
                  <Input
                    type="number"
                    variant="outline"
                    // FIXME
                    // @ts-expect-error - metadata[field.key] is a valid value for the input
                    value={metadata[field.key] ?? ''}
                    onChange={(e) => handleMetadataChange(field.key, parseFloat(e.target.value))}
                    placeholder={
                      'placeholder' in field.config ? field.config.placeholder : undefined
                    }
                  />
                ) : field.type === 'textarea' ? (
                  <Textarea
                    variant="outline"
                    rows={3}
                    // FIXME
                    // @ts-expect-error - metadata[field.key] is a valid value for the textarea
                    value={metadata[field.key] ?? ''}
                    readOnly
                    onClick={() => openEditor('metadata', field.key)}
                    placeholder={
                      'placeholder' in field.config
                        ? field.config.placeholder
                        : 'Click to edit in fullscreen editor...'
                    }
                    cursor="pointer"
                    _hover={{
                      borderColor: 'brand.matrix',
                    }}
                  />
                ) : field.type === 'select' || field.type === 'multiselect' ? (
                  <MetadataSelectField
                    field={field}
                    value={metadata[field.key]}
                    onChange={(val) => handleMetadataChange(field.key, val)}
                  />
                ) : (
                  <Input
                    variant="outline"
                    // FIXME
                    // @ts-expect-error - metadata[field.key] is a valid value for the input
                    value={metadata[field.key] ?? ''}
                    onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                    placeholder={
                      'placeholder' in field.config ? field.config.placeholder : undefined
                    }
                  />
                )}
              </Field.Root>
            );
          })}

          <Field.Root>
            <Field.Label color="text.mist">Note</Field.Label>
            <Textarea
              variant="outline"
              rows={2}
              value={note}
              readOnly
              onClick={() => openEditor('note')}
              placeholder="Click to edit in fullscreen editor..."
              cursor="pointer"
              _hover={{
                borderColor: 'brand.matrix',
              }}
            />
          </Field.Root>
        </VStack>
      )}

      <HStack gap={4} pt={4}>
        <Button variant="ghost" flex={1} onClick={onCancel}>
          CANCEL
        </Button>
        <Button
          variant="primary"
          flex={1}
          onClick={handleSubmit}
          loading={isLoading}
          disabled={!selectedDefId}
        >
          {isEditing ? 'SAVE CHANGES' : 'SAVE RECORD'}
        </Button>
      </HStack>
    </VStack>
  );
}
