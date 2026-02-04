'use client';

import { VStack, Text, Box, Collapsible } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

import {
  useBehaviorDefinitions,
  useCreateBehaviorDefinition,
} from '@/client/hooks/use-behavior-definitions';
import {
  useCreateBehaviorRecord,
  useUpdateBehaviorRecord,
} from '@/client/hooks/use-behavior-records';
import { BehaviorCategory } from '@/server/types/behavior-server';

import { EditorField } from '../fields/editor-field';
import { InputField } from '../fields/input-field';
import { SelectField } from '../fields/select-field';

import { DefinitionFormFields } from './definition-form';
import { FormButtonGroup } from './form-button-group';

import type {
  MetadataField,
  MetadataValue,
  MetadataRecord,
  BehaviorRecordWithDefinition,
} from '@/client/types/behavior-client';

const ADD_DEFINITION_VALUE = '__add_definition__';

export function RecordForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: BehaviorRecordWithDefinition;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const { definitions, isLoading: loadingDefs } = useBehaviorDefinitions();
  const { createDefinition, isLoading: savingDef } = useCreateBehaviorDefinition();
  const { createRecord, isLoading: savingRecord } = useCreateBehaviorRecord();
  const { updateRecord, isLoading: updatingRecord } = useUpdateBehaviorRecord();

  const isEditing = !!initialData;
  const isLoading = savingRecord || updatingRecord;

  const [selectedDefId, setSelectedDefId] = useState<string>(initialData?.definitionId || '');
  const [metadata, setMetadata] = useState<MetadataRecord>(initialData?.metadata || {});
  const [note, setNote] = useState(initialData?.note || '');

  // Inline definition creation state
  const [isAddingDefinition, setIsAddingDefinition] = useState(false);
  const [newDefName, setNewDefName] = useState('');
  const [newDefCategory, setNewDefCategory] = useState<BehaviorCategory>(BehaviorCategory.Other);
  const [newDefIcon, setNewDefIcon] = useState('');
  const [newDefMetadataSchema, setNewDefMetadataSchema] = useState<MetadataField[]>([]);

  const selectedDef = definitions.find((d) => d.id === selectedDefId);

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

  return (
    <VStack gap={6} align="stretch" w="full">
      <SelectField
        label="Select Behavior"
        value={isAddingDefinition ? ADD_DEFINITION_VALUE : selectedDefId}
        onChange={(value) => {
          const stringValue = typeof value === 'string' ? value : '';
          handleSelectChange(stringValue);
        }}
        options={[
          { label: '+ Add New Definition', value: ADD_DEFINITION_VALUE },
          ...definitions.map((d) => ({
            label: `${d.icon ? d.icon + ' ' : ''}${d.name}`,
            value: d.id,
          })),
        ]}
        placeholder="Choose a behavior..."
        invalid={!selectedDefId && !isAddingDefinition}
        disabled={loadingDefs}
        getItemProps={(item) => {
          if (item.value === ADD_DEFINITION_VALUE) {
            return {
              color: 'brand.matrix',
              fontWeight: 'bold',
            };
          }
          return {};
        }}
      />

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
            if (field.type === 'textarea')
              return (
                <EditorField
                  label={field.name}
                  value={(() => {
                    const fieldValue = metadata[field.key];
                    return typeof fieldValue === 'string' ? fieldValue : '';
                  })()}
                  onChange={(value) => handleMetadataChange(field.key, value)}
                  placeholder={
                    'placeholder' in field.config
                      ? field.config.placeholder
                      : 'Click to edit in fullscreen editor...'
                  }
                  title="METADATA EDITOR"
                  rows={3}
                />
              );
            if (field.type === 'number' || field.type === 'currency') {
              return (
                <InputField
                  key={field.key}
                  label={field.name}
                  value={metadata[field.key]}
                  onChange={(value) => handleMetadataChange(field.key, value)}
                  type={field.type}
                  placeholder={'placeholder' in field.config ? field.config.placeholder : undefined}
                  required={field.required}
                />
              );
            }
            if (field.type === 'select' || field.type === 'multiselect') {
              return (
                <SelectField
                  key={field.key}
                  label={field.name}
                  value={metadata[field.key]}
                  onChange={(value) => handleMetadataChange(field.key, value)}
                  options={field.config.options || []}
                  multiple={field.type === 'multiselect'}
                  placeholder={
                    'placeholder' in field.config ? field.config.placeholder : 'Choose an option...'
                  }
                  required={field.required}
                />
              );
            }
            return (
              <InputField
                key={field.key}
                label={field.name}
                value={metadata[field.key]}
                onChange={(value) => handleMetadataChange(field.key, value)}
                type="text"
                placeholder={'placeholder' in field.config ? field.config.placeholder : undefined}
                required={field.required}
              />
            );
          })}

          <EditorField
            label="Note"
            value={note}
            onChange={setNote}
            placeholder="Add a comment..."
            title="NOTE EDITOR"
            rows={2}
          />
        </VStack>
      )}

      <FormButtonGroup
        onCancel={onCancel || (() => {})}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        disabled={!selectedDefId}
      />
    </VStack>
  );
}
