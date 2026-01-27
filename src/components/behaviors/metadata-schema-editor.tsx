'use client';

import { VStack, HStack, Text, Button } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { useState } from 'react';
import type { MetadataField } from '@/types/behavior-client';
import { MetadataFieldEditor, createDefaultField } from './metadata-field-editor';

interface MetadataSchemaEditorProps {
  value: MetadataField[];
  onChange: (schema: MetadataField[]) => void;
}

export function MetadataSchemaEditor({ value, onChange }: MetadataSchemaEditorProps) {
  const [expandedConfigs, setExpandedConfigs] = useState<Set<number>>(new Set());

  const toggleConfig = (index: number) => {
    setExpandedConfigs((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleAddField = () => {
    onChange([...value, createDefaultField('text')]);
  };

  const handleRemoveField = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setExpandedConfigs((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const handleFieldChange = (index: number, field: MetadataField) => {
    const newSchema = [...value];
    newSchema[index] = field;
    onChange(newSchema);
  };

  return (
    <VStack gap={4} align="stretch" w="full">
      <HStack justify="space-between">
        <Text color="brand.matrix" fontSize="sm" fontFamily="mono">
          METADATA FIELDS
        </Text>
        <Button size="xs" variant="ghost" onClick={handleAddField}>
          <LuPlus />
          Add Field
        </Button>
      </HStack>

      {value.length === 0 && (
        <Text color="text.mist" fontSize="sm" fontStyle="italic">
          No metadata fields. Click &quot;Add Field&quot; to add one.
        </Text>
      )}

      {value.map((field, index) => (
        <MetadataFieldEditor
          key={index}
          field={field}
          isConfigExpanded={expandedConfigs.has(index)}
          onToggleConfig={() => toggleConfig(index)}
          onChange={(f) => handleFieldChange(index, f)}
          onRemove={() => handleRemoveField(index)}
        />
      ))}
    </VStack>
  );
}
