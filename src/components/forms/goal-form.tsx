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
  Box,
  Portal,
} from '@chakra-ui/react';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import { useBehaviorDefinitions } from '@/hooks/use-behavior-definitions';
import { useCreateGoal, useUpdateGoal } from '@/hooks/use-goals';
import type { GoalCriteria } from '@/types/goal-client';
import { GoalMetric, GoalOperator, GoalPeriod, GoalCategory } from '@/types/goal-client';
import { useEditorModalStore } from '@/store/editor-modal-store';

interface GoalFormProps {
  initialData?: {
    id: string;
    name: string;
    description?: string;
    category: GoalCategory;
    startDate: string;
    endDate?: string;
    criteria: GoalCriteria[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const categoryOptions = [
  { label: 'Health', value: GoalCategory.Health },
  { label: 'Finance', value: GoalCategory.Finance },
  { label: 'Habit', value: GoalCategory.Habit },
  { label: 'Learning', value: GoalCategory.Learning },
  { label: 'Other', value: GoalCategory.Other },
];

const categoryCollection = createListCollection({
  items: categoryOptions,
});

const metricOptions = [
  { label: 'Count', value: GoalMetric.Count },
  { label: 'Sum', value: GoalMetric.Sum },
  { label: 'Average', value: GoalMetric.Avg },
];

const metricCollection = createListCollection({
  items: metricOptions,
});

const operatorOptions = [
  { label: '>', value: GoalOperator.GreaterThan },
  { label: '>=', value: GoalOperator.GreaterThanOrEqual },
  { label: '<', value: GoalOperator.LessThan },
  { label: '<=', value: GoalOperator.LessThanOrEqual },
  { label: '==', value: GoalOperator.Equal },
];

const operatorCollection = createListCollection({
  items: operatorOptions,
});

const periodOptions = [
  { label: 'Daily', value: GoalPeriod.Daily },
  { label: 'Weekly', value: GoalPeriod.Weekly },
  { label: 'Monthly', value: GoalPeriod.Monthly },
];

const periodCollection = createListCollection({
  items: periodOptions,
});

const createEmptyCriterion = (): GoalCriteria => ({
  behaviorId: '',
  metric: GoalMetric.Count,
  operator: GoalOperator.GreaterThanOrEqual,
  value: 1,
  period: GoalPeriod.Daily,
  description: '',
});

export function GoalForm({ initialData, onSuccess, onCancel }: GoalFormProps) {
  const { definitions, isLoading: loadingDefs } = useBehaviorDefinitions();
  const { createGoal, isLoading: saving } = useCreateGoal();
  const { updateGoal } = useUpdateGoal();

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const { openModal } = useEditorModalStore();
  const [category, setCategory] = useState<GoalCategory>(
    initialData?.category || GoalCategory.Other,
  );
  const [startDate, setStartDate] = useState(
    initialData?.startDate ? initialData.startDate.split('T')[0] : '',
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate ? initialData.endDate.split('T')[0] : '',
  );
  const [criteria, setCriteria] = useState<GoalCriteria[]>(() => {
    if (
      initialData?.criteria &&
      Array.isArray(initialData.criteria) &&
      initialData.criteria.length > 0
    ) {
      return initialData.criteria;
    }
    return [createEmptyCriterion()];
  });

  const isEditing = !!initialData;

  // Update criteria when initialData changes (e.g., when goal loads)
  useEffect(() => {
    if (initialData) {
      // Always use the criteria from initialData if it exists, even if empty
      // This ensures we show the correct data when editing
      if (initialData.criteria && Array.isArray(initialData.criteria)) {
        // If criteria array is empty, show at least one empty criterion
        setCriteria(
          initialData.criteria.length > 0 ? initialData.criteria : [createEmptyCriterion()],
        );
      } else {
        setCriteria([createEmptyCriterion()]);
      }
    }
  }, [initialData]);

  const behaviorCollection = createListCollection({
    items: definitions.map((d) => ({
      label: `${d.icon ? d.icon + ' ' : ''}${d.name}`,
      value: d.id,
    })),
  });

  const handleAddCriterion = () => {
    setCriteria((prev) => [...prev, createEmptyCriterion()]);
  };

  const handleRemoveCriterion = (index: number) => {
    setCriteria((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCriterionChange = (index: number, field: keyof GoalCriteria, value: unknown) => {
    setCriteria((prev) => {
      const updated = [...prev];

      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!name.trim() || !startDate || criteria.length === 0) return;

    // Validate criteria
    const validCriteria = criteria.filter(
      (c) => c.behaviorId && c.description.trim() && c.value > 0,
    );
    if (validCriteria.length === 0) return;

    // Validate end date
    if (endDate && new Date(endDate) < new Date(startDate)) {
      return;
    }

    try {
      if (isEditing && initialData) {
        await updateGoal({
          id: initialData.id,
          updates: {
            name: name.trim(),
            description: description.trim() || undefined,
            category,
            startDate,
            endDate: endDate || undefined,
            criteria: validCriteria,
          },
        });
      } else {
        await createGoal({
          name: name.trim(),
          description: description.trim() || undefined,
          category,
          startDate,
          endDate: endDate || undefined,
          criteria: validCriteria,
        });
      }
      if (onSuccess) onSuccess();
    } catch {
      // Error handled by hook
    }
  };

  const isFormValid =
    name.trim() &&
    startDate &&
    criteria.length > 0 &&
    criteria.every((c) => c.behaviorId && c.description.trim() && c.value > 0) &&
    (!endDate || new Date(endDate) >= new Date(startDate));

  return (
    <VStack gap={6} align="stretch" w="full">
      {/* Basic Info */}
      <VStack gap={4} align="stretch">
        <Field.Root required invalid={!name.trim()}>
          <Field.Label color="text.mist">Goal Name</Field.Label>
          <Input
            variant="outline"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Run 5km daily, Save $1000"
          />
        </Field.Root>

        <Field.Root>
          <Field.Label color="text.mist">Description</Field.Label>
          <Textarea
            variant="outline"
            rows={2}
            value={description}
            readOnly
            onClick={() => {
              openModal({
                value: description,
                onChange: setDescription,
                onSave: (value) => {
                  setDescription(value);
                },
                placeholder: 'Optional description...',
                title: 'GOAL DESCRIPTION EDITOR',
              });
            }}
            placeholder="Click to edit in fullscreen editor..."
            cursor="pointer"
            _hover={{
              borderColor: 'brand.matrix',
            }}
          />
        </Field.Root>

        <HStack gap={4}>
          <Field.Root required flex={1} invalid={!category}>
            <Field.Label color="text.mist">Category</Field.Label>
            <Select.Root
              collection={categoryCollection}
              value={[category]}
              onValueChange={(e) => {
                const value = e.value[0];
                const matchedCategory = Object.values(GoalCategory).find((c) => c === value);
                if (matchedCategory) setCategory(matchedCategory);
              }}
            >
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

          <Field.Root required flex={1} invalid={!startDate}>
            <Field.Label color="text.mist">Start Date</Field.Label>
            <Input
              type="date"
              variant="outline"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field.Root>

          <Field.Root flex={1}>
            <Field.Label color="text.mist">End Date (Optional)</Field.Label>
            <Input
              type="date"
              variant="outline"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
            />
          </Field.Root>
        </HStack>
      </VStack>

      {/* Criteria */}
      <VStack gap={4} align="stretch">
        <HStack justify="space-between">
          <Text
            color="brand.matrix"
            fontSize="sm"
            fontFamily="mono"
            borderBottom="1px solid"
            borderColor="rgba(0, 255, 65, 0.2)"
            pb={2}
          >
            COMPLETION CRITERIA
          </Text>
          <Button size="xs" variant="ghost" onClick={handleAddCriterion}>
            <LuPlus style={{ marginRight: 4 }} />
            Add Criterion
          </Button>
        </HStack>

        {criteria.map((criterion, index) => (
          <Box
            key={index}
            p={4}
            borderWidth="1px"
            borderColor="brand.matrix"
            borderRadius="md"
            bg="rgba(0, 255, 65, 0.02)"
          >
            <VStack gap={3} align="stretch">
              <HStack justify="space-between">
                <Text color="text.mist" fontSize="sm" fontFamily="mono">
                  Criterion {index + 1}
                </Text>
                {criteria.length > 1 && (
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleRemoveCriterion(index)}
                  >
                    <LuTrash2 />
                  </Button>
                )}
              </HStack>

              <Field.Root required invalid={!criterion.behaviorId}>
                <Field.Label color="text.mist">Behavior</Field.Label>
                <Select.Root
                  collection={behaviorCollection}
                  value={criterion.behaviorId ? [criterion.behaviorId] : []}
                  onValueChange={(e) => {
                    const value = e.value[0];
                    if (typeof value === 'string') {
                      handleCriterionChange(index, 'behaviorId', value);
                    }
                  }}
                  disabled={loadingDefs}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select behavior..." />
                  </Select.Trigger>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                        {behaviorCollection.items.map((item) => (
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

              <HStack gap={2}>
                <Field.Root flex={2}>
                  <Field.Label color="text.mist">Metric</Field.Label>
                  <Select.Root
                    collection={metricCollection}
                    value={[criterion.metric]}
                    onValueChange={(e) => {
                      const value = e.value[0];
                      if (
                        value === GoalMetric.Count ||
                        value === GoalMetric.Sum ||
                        value === GoalMetric.Avg
                      ) {
                        handleCriterionChange(index, 'metric', value);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                          {metricCollection.items.map((item) => (
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

                <Field.Root flex={1}>
                  <Field.Label color="text.mist">Operator</Field.Label>
                  <Select.Root
                    collection={operatorCollection}
                    value={[criterion.operator]}
                    onValueChange={(e) => {
                      const value = e.value[0];
                      if (
                        value === GoalOperator.GreaterThan ||
                        value === GoalOperator.GreaterThanOrEqual ||
                        value === GoalOperator.LessThan ||
                        value === GoalOperator.LessThanOrEqual ||
                        value === GoalOperator.Equal
                      ) {
                        handleCriterionChange(index, 'operator', value);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                          {operatorCollection.items.map((item) => (
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

                <Field.Root flex={1}>
                  <Field.Label color="text.mist">Value</Field.Label>
                  <Input
                    type="number"
                    variant="outline"
                    value={criterion.value}
                    onChange={(e) =>
                      handleCriterionChange(index, 'value', parseFloat(e.target.value) || 0)
                    }
                    min={0}
                    step={0.01}
                  />
                </Field.Root>

                <Field.Root flex={1}>
                  <Field.Label color="text.mist">Period</Field.Label>
                  <Select.Root
                    collection={periodCollection}
                    value={[criterion.period]}
                    onValueChange={(e) => {
                      const value = e.value[0];
                      if (
                        value === GoalPeriod.Daily ||
                        value === GoalPeriod.Weekly ||
                        value === GoalPeriod.Monthly
                      ) {
                        handleCriterionChange(index, 'period', value);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                          {periodCollection.items.map((item) => (
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
              </HStack>

              <Field.Root required invalid={!criterion.description.trim()}>
                <Field.Label color="text.mist">Description</Field.Label>
                <Input
                  variant="outline"
                  value={criterion.description}
                  onChange={(e) => handleCriterionChange(index, 'description', e.target.value)}
                  placeholder="e.g., Run at least 5km daily"
                />
              </Field.Root>
            </VStack>
          </Box>
        ))}
      </VStack>

      <HStack gap={4} pt={4}>
        <Button variant="ghost" flex={1} onClick={onCancel}>
          CANCEL
        </Button>
        <Button
          variant="primary"
          flex={1}
          onClick={handleSubmit}
          loading={saving}
          disabled={!isFormValid}
        >
          CREATE GOAL
        </Button>
      </HStack>
    </VStack>
  );
}
