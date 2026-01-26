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
import { useCreateBehaviorDefinition } from '@/hooks/use-behavior-definitions';
import { BehaviorCategory } from '@/types/behavior-server';

interface DefinitionFormProps {
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

export function DefinitionForm({ onSuccess, onCancel }: DefinitionFormProps) {
  const { createDefinition, isLoading: saving } = useCreateBehaviorDefinition();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<BehaviorCategory>(BehaviorCategory.Other);
  const [icon, setIcon] = useState('');

  const categoryCollection = createListCollection({
    items: categoryOptions.map((opt) => ({ label: opt.label, value: opt.value })),
  });

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      await createDefinition({
        name: name.trim(),
        category,
        icon: icon.trim() || undefined,
        metadataSchema: [],
      });
      if (onSuccess) onSuccess();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <VStack gap={6} align="stretch" w="full">
      <Field.Root required invalid={!name.trim()}>
        <Field.Label color="text.mist" mb={2}>
          Behavior Name
        </Field.Label>
        <Input
          variant="outline"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Running, Coffee, Daily Expense"
        />
      </Field.Root>

      <Field.Root required>
        <Field.Label color="text.mist" mb={2}>
          Category
        </Field.Label>
        <Select.Root
          collection={categoryCollection}
          value={[category]}
          onValueChange={(e) => setCategory(e.value[0] as BehaviorCategory)}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
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
        <Field.Label color="text.mist" mb={2}>
          Icon (Emoji)
        </Field.Label>
        <Input
          variant="outline"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="e.g., 🏃, ☕, 💰"
          maxLength={2}
        />
        <Field.HelperText color="text.mist" fontSize="xs">
          Optional: Add an emoji icon
        </Field.HelperText>
      </Field.Root>

      <Text
        color="text.mist"
        fontSize="xs"
        fontFamily="mono"
        borderTop="1px solid"
        borderColor="rgba(0, 255, 65, 0.2)"
        pt={4}
      >
        NOTE: Metadata fields can be added later by editing the definition.
      </Text>

      <HStack gap={4} pt={4}>
        <Button variant="ghost" flex={1} onClick={onCancel}>
          CANCEL
        </Button>
        <Button
          variant="primary"
          flex={1}
          onClick={handleSubmit}
          loading={saving}
          disabled={!name.trim()}
        >
          CREATE DEFINITION
        </Button>
      </HStack>
    </VStack>
  );
}
