'use client';

import { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { useBehaviorDefinitions } from '@/hooks/use-behavior-definitions';
import { useCreateBehaviorRecord } from '@/hooks/use-behavior-records';
import type { MetadataField, MetadataValue, MetadataRecord } from '@/types/behavior-client';

interface RecordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RecordForm({ onSuccess, onCancel }: RecordFormProps) {
  const { definitions, isLoading: loadingDefs } = useBehaviorDefinitions();
  const { createRecord, isLoading: saving } = useCreateBehaviorRecord();

  const [selectedDefId, setSelectedDefId] = useState<string>('');
  const [metadata, setMetadata] = useState<MetadataRecord>({});
  const [note, setNote] = useState('');

  const selectedDef = definitions.find((d) => d.id === selectedDefId);

  // Initialize metadata with default values when definition changes
  useEffect(() => {
    if (selectedDef) {
      const initialMetadata: MetadataRecord = {};
      selectedDef.metadataSchema.forEach((field) => {
        initialMetadata[field.key] = (field.config.defaultValue as MetadataValue) ?? '';
      });
      setMetadata(initialMetadata);
    } else {
      setMetadata({});
    }
  }, [selectedDef]);

  const handleSubmit = async () => {
    if (!selectedDefId) return;

    try {
      await createRecord({
        definitionId: selectedDefId,
        metadata,
        note,
      });
      if (onSuccess) onSuccess();
    } catch {
      // Error handled by hook
    }
  };

  const handleMetadataChange = (key: string, value: MetadataValue) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const definitionCollection = createListCollection({
    items: definitions.map((d) => ({ label: d.name, value: d.id })),
  });

  return (
    <VStack gap={6} align="stretch" w="full">
      <Field.Root invalid={!selectedDefId}>
        <Field.Label color="text.mist" mb={2}>
          Select Behavior
        </Field.Label>
        <Select.Root
          collection={definitionCollection}
          value={[selectedDefId]}
          onValueChange={(e) => setSelectedDefId(e.value[0])}
          disabled={loadingDefs}
        >
          <Select.Trigger>
            <Select.ValueText placeholder="Choose a behavior..." />
          </Select.Trigger>
          <Select.Content bg="bg.carbon" borderColor="brand.matrix">
            {definitionCollection.items.map((item) => (
              <Select.Item item={item} key={item.value} _hover={{ bg: 'rgba(0, 255, 65, 0.1)' }}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Field.Root>

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

          {selectedDef.metadataSchema.map((field: MetadataField) => (
            <Field.Root key={field.key} required={field.required}>
              <Field.Label color="text.mist">{field.name}</Field.Label>
              {field.type === 'number' || field.type === 'currency' ? (
                <Input
                  type="number"
                  variant="outline"
                  value={(metadata[field.key] as string | number) ?? ''}
                  onChange={(e) => handleMetadataChange(field.key, parseFloat(e.target.value))}
                  placeholder={'placeholder' in field.config ? field.config.placeholder : undefined}
                />
              ) : field.type === 'textarea' ? (
                <Textarea
                  variant="outline"
                  rows={3}
                  value={(metadata[field.key] as string) ?? ''}
                  onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                  placeholder={'placeholder' in field.config ? field.config.placeholder : undefined}
                />
              ) : (
                <Input
                  variant="outline"
                  value={(metadata[field.key] as string) ?? ''}
                  onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                  placeholder={'placeholder' in field.config ? field.config.placeholder : undefined}
                />
              )}
            </Field.Root>
          ))}

          <Field.Root>
            <Field.Label color="text.mist">Note</Field.Label>
            <Textarea
              variant="outline"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a comment..."
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
          loading={saving}
          disabled={!selectedDefId}
        >
          SAVE RECORD
        </Button>
      </HStack>
    </VStack>
  );
}
