'use client';

import { useState } from 'react';
import {
  useCreateBehaviorDefinition,
  useUpdateBehaviorDefinition,
} from '@/hooks/use-behavior-definitions';
import { BehaviorCategory } from '@/types/behavior-server';
import type { MetadataField } from '@/types/behavior-client';
import { VStack, Field } from '@chakra-ui/react';
import { MetadataSchemaEditor } from './metadata-schema-editor';
import { InputField } from '../fields/input-field';
import { SelectField } from '../fields/select-field';
import { FormButtonGroup } from './form-button-group';

interface DefinitionFormProps {
  initialData?: {
    id: string;
    name: string;
    category: BehaviorCategory;
    icon?: string;
    metadataSchema: MetadataField[];
  };
  onSuccess?: () => void;
  onCancel: () => void;
}

export function DefinitionForm({ initialData, onSuccess, onCancel }: DefinitionFormProps) {
  const { createDefinition, isLoading: savingDef } = useCreateBehaviorDefinition();
  const { updateDefinition, isLoading: updatingDef } = useUpdateBehaviorDefinition();
  const isEditing = !!initialData;
  const isLoading = savingDef || updatingDef;
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<BehaviorCategory>(
    initialData?.category || BehaviorCategory.Other,
  );
  const [icon, setIcon] = useState(initialData?.icon || '');
  const [metadataSchema, setMetadataSchema] = useState<MetadataField[]>(
    initialData?.metadataSchema || [],
  );
  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      if (isEditing && initialData) {
        await updateDefinition({
          id: initialData.id,
          updates: {
            name: name.trim(),
            category,
            icon: icon.trim() || undefined,
            metadataSchema: metadataSchema.filter((f) => f.name && f.key),
          },
        });
      } else {
        await createDefinition({
          name: name.trim(),
          category,
          icon: icon.trim() || undefined,
          metadataSchema: metadataSchema.filter((f) => f.name && f.key),
        });
      }
      if (onSuccess) onSuccess();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <DefinitionFormFields
      name={name}
      category={category}
      icon={icon}
      metadataSchema={metadataSchema}
      onNameChange={setName}
      onCategoryChange={setCategory}
      onIconChange={setIcon}
      onMetadataSchemaChange={setMetadataSchema}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
}

const categoryOptions = [
  { label: 'Health', value: BehaviorCategory.Health },
  { label: 'Expense', value: BehaviorCategory.Expense },
  { label: 'Income', value: BehaviorCategory.Income },
  { label: 'Habit', value: BehaviorCategory.Habit },
  { label: 'Other', value: BehaviorCategory.Other },
];

export function DefinitionFormFields({
  name,
  category,
  icon,
  metadataSchema,
  onNameChange,
  onCategoryChange,
  onIconChange,
  onMetadataSchemaChange,
  onSubmit,
  onCancel,
  isLoading = false,
}: {
  name: string;
  category: BehaviorCategory;
  icon: string;
  metadataSchema: MetadataField[];
  onNameChange: (name: string) => void;
  onCategoryChange: (category: BehaviorCategory) => void;
  onIconChange: (icon: string) => void;
  onMetadataSchemaChange: (schema: MetadataField[]) => void;
  // Button props
  onSubmit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const isFormValid = name.trim().length > 0;
  return (
    <VStack align="stretch" w="full">
      <InputField
        label="Name"
        value={name}
        onChange={(value) => onNameChange(typeof value === 'string' ? value : '')}
        type="text"
        placeholder="e.g., Exercise, Coffee, Meeting"
        required
        invalid={!name.trim()}
      />
      <SelectField
        label="Category"
        value={category}
        onChange={(value) => {
          const matchedCategory = Object.values(BehaviorCategory).find((c) => c === value);
          if (matchedCategory) onCategoryChange(matchedCategory);
        }}
        options={categoryOptions}
        transformValue={(value) => {
          const matchedCategory = Object.values(BehaviorCategory).find((c) => c === value);
          return matchedCategory || value;
        }}
      />
      <InputField
        label="Icon"
        value={icon}
        onChange={(value) => onIconChange(typeof value === 'string' ? value : '')}
        type="text"
        placeholder="e.g., 🏃, ☕, 📝"
      />
      <Field.Root>
        <Field.Label color="text.mist">Metadata Schema</Field.Label>
        <MetadataSchemaEditor value={metadataSchema} onChange={onMetadataSchemaChange} />
      </Field.Root>
      <FormButtonGroup
        onCancel={onCancel}
        onSubmit={onSubmit}
        isLoading={isLoading}
        disabled={!isFormValid}
      />
    </VStack>
  );
}
