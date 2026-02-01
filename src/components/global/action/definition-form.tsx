'use client';

import { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Field,
  createListCollection,
  Select,
} from '@chakra-ui/react';
import {
  useCreateBehaviorDefinition,
  useUpdateBehaviorDefinition,
} from '@/hooks/use-behavior-definitions';
import { MetadataSchemaEditor } from '@/components/global/action/metadata-schema-editor';
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
  onCancel?: () => void;
}

const categoryOptions = [
  { label: 'Health', value: BehaviorCategory.Health },
  { label: 'Expense', value: BehaviorCategory.Expense },
  { label: 'Income', value: BehaviorCategory.Income },
  { label: 'Habit', value: BehaviorCategory.Habit },
  { label: 'Other', value: BehaviorCategory.Other },
];

const categoryCollection = createListCollection({
  items: categoryOptions.map((opt) => ({ label: opt.label, value: opt.value })),
});

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

  const isFormValid = name.trim().length > 0;

  return (
    <VStack gap={6} align="stretch" w="full">
      <Field.Root required invalid={!name.trim()}>
        <Field.Label color="text.mist">Name</Field.Label>
        <Input
          variant="outline"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Exercise, Coffee, Meeting"
        />
      </Field.Root>

      <Field.Root>
        <Field.Label color="text.mist">Category</Field.Label>
        <Select.Root
          value={[category]}
          onValueChange={(e) => {
            const selectedValue = e.value[0];
            const matchedCategory = Object.values(BehaviorCategory).find(
              (c) => c === selectedValue,
            );
            if (matchedCategory) setCategory(matchedCategory);
          }}
          collection={categoryCollection}
        >
          <Select.Trigger />
          <Select.Content bg="bg.carbon" borderColor="brand.matrix">
            {categoryCollection.items.map((item) => (
              <Select.Item item={item} key={item.value} _hover={{ bg: 'rgba(0, 255, 65, 0.1)' }}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Field.Root>

      <Field.Root>
        <Field.Label color="text.mist">Icon (Optional)</Field.Label>
        <Input
          variant="outline"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="e.g., 🏃, ☕, 📝"
        />
        <Text fontSize="xs" color="text.dim" mt={1}>
          Emoji or icon character
        </Text>
      </Field.Root>

      <Field.Root>
        <Field.Label color="text.mist">Metadata Schema</Field.Label>
        <MetadataSchemaEditor value={metadataSchema} onChange={setMetadataSchema} />
      </Field.Root>

      <HStack gap={4} pt={4}>
        <Button variant="ghost" flex={1} onClick={onCancel}>
          CANCEL
        </Button>
        <Button
          variant="primary"
          flex={1}
          onClick={handleSubmit}
          loading={isLoading}
          disabled={!isFormValid}
        >
          {isEditing ? 'SAVE CHANGES' : 'CREATE DEFINITION'}
        </Button>
      </HStack>
    </VStack>
  );
}
