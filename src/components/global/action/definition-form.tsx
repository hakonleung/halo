'use client';

import { useState } from 'react';
import {
  useCreateBehaviorDefinition,
  useUpdateBehaviorDefinition,
} from '@/hooks/use-behavior-definitions';
import { DefinitionFormFields } from './definition-form-fields';
import { BehaviorCategory } from '@/types/behavior-server';
import type { MetadataField } from '@/types/behavior-client';

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
