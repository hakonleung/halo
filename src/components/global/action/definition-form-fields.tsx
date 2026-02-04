'use client';

import {
  VStack,
  HStack,
  Input,
  Field,
  createListCollection,
  Select,
  Portal,
  Button,
} from '@chakra-ui/react';
import { MetadataSchemaEditor } from './metadata-schema-editor';
import { BehaviorCategory } from '@/types/behavior-server';
import type { MetadataField } from '@/types/behavior-client';

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
      <Field.Root required invalid={!name.trim()}>
        <Field.Label color="text.mist">Name</Field.Label>
        <Input
          variant="outline"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
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
            if (matchedCategory) onCategoryChange(matchedCategory);
          }}
          collection={categoryCollection}
        >
          <Select.HiddenSelect />
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Portal>
            <Select.Positioner>
              <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                {categoryCollection.items.map((item) => (
                  <Select.Item
                    item={item}
                    key={item.value}
                    _hover={{ bg: 'rgba(0, 255, 65, 0.1)' }}
                  >
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </Field.Root>
      <Field.Root>
        <Field.Label color="text.mist">{'Icon (Optional)'}</Field.Label>
        <Input
          variant="outline"
          value={icon}
          onChange={(e) => onIconChange(e.target.value)}
          placeholder="e.g., 🏃, ☕, 📝"
        />
        <Field.HelperText fontSize="xs" color="text.dim" mt={1}>
          Emoji or icon character
        </Field.HelperText>
      </Field.Root>
      <Field.Root>
        <Field.Label color="text.mist">Metadata Schema</Field.Label>
        <MetadataSchemaEditor value={metadataSchema} onChange={onMetadataSchemaChange} />
      </Field.Root>
      <HStack pt={4}>
        <Button variant="ghost" flex={1} onClick={onCancel}>
          CANCEL
        </Button>
        <Button
          variant="primary"
          flex={1}
          onClick={onSubmit}
          loading={isLoading}
          disabled={!isFormValid}
        >
          SAVE
        </Button>
      </HStack>
    </VStack>
  );
}
