'use client';

import { useState, useEffect } from 'react';
import { VStack, HStack, Text, Button, Box, Field } from '@chakra-ui/react';
import { EditorField } from '../fields/editor-field';
import { InputField } from '../fields/input-field';
import { SelectField } from '../fields/select-field';
import { FormButtonGroup } from './form-button-group';
import { DatePicker } from '@/components/shared/date-picker';
import { parseDate, type DatePickerValueChangeDetails } from '@ark-ui/react';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import { useBehaviorDefinitions } from '@/hooks/use-behavior-definitions';
import { useCreateGoal, useUpdateGoal } from '@/hooks/use-goals';
import type { Goal, GoalCriteria } from '@/types/goal-client';
import { GoalMetric, GoalOperator, GoalPeriod, GoalCategory } from '@/types/goal-client';

const categoryOptions = [
  { label: 'Health', value: GoalCategory.Health },
  { label: 'Finance', value: GoalCategory.Finance },
  { label: 'Habit', value: GoalCategory.Habit },
  { label: 'Learning', value: GoalCategory.Learning },
  { label: 'Other', value: GoalCategory.Other },
];

const metricOptions = [
  { label: 'Count', value: GoalMetric.Count },
  { label: 'Sum', value: GoalMetric.Sum },
  { label: 'Average', value: GoalMetric.Avg },
];

const operatorOptions = [
  { label: '>', value: GoalOperator.GreaterThan },
  { label: '>=', value: GoalOperator.GreaterThanOrEqual },
  { label: '<', value: GoalOperator.LessThan },
  { label: '<=', value: GoalOperator.LessThanOrEqual },
  { label: '==', value: GoalOperator.Equal },
];

const periodOptions = [
  { label: 'Daily', value: GoalPeriod.Daily },
  { label: 'Weekly', value: GoalPeriod.Weekly },
  { label: 'Monthly', value: GoalPeriod.Monthly },
];

const createEmptyCriterion = (): GoalCriteria => ({
  behaviorId: '',
  metric: GoalMetric.Count,
  operator: GoalOperator.GreaterThanOrEqual,
  value: 1,
  period: GoalPeriod.Daily,
  description: '',
});

export function GoalForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: Goal;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const { definitions } = useBehaviorDefinitions();
  const { createGoal, isLoading: saving } = useCreateGoal();
  const { updateGoal } = useUpdateGoal();

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
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
        <InputField
          label="Goal Name"
          value={name}
          onChange={(value) => setName(typeof value === 'string' ? value : '')}
          type="text"
          placeholder="e.g., Run 5km daily, Save $1000"
          required
          invalid={!name.trim()}
        />

        <EditorField
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Optional description..."
          title="GOAL DESCRIPTION EDITOR"
          rows={2}
        />

        <HStack gap={4}>
          <SelectField
            label="Category"
            value={category}
            onChange={(value) => {
              const matchedCategory = Object.values(GoalCategory).find((c) => c === value);
              if (matchedCategory) setCategory(matchedCategory);
            }}
            options={categoryOptions}
            required
            invalid={!category}
            flex={1}
            transformValue={(value) => {
              const matchedCategory = Object.values(GoalCategory).find((c) => c === value);
              return matchedCategory || value;
            }}
          />

          <Field.Root required={!startDate} invalid={!startDate} flex={1}>
            <Field.Label color="text.mist">Start Date</Field.Label>
            <DatePicker
              placeholder="Start date"
              value={startDate ? [parseDate(startDate)] : []}
              onValueChange={(details: DatePickerValueChangeDetails) => {
                const firstValue = details.value[0];
                if (firstValue) {
                  setStartDate(firstValue.toString().split('T')[0]);
                }
              }}
            />
          </Field.Root>

          <Field.Root flex={1}>
            <Field.Label color="text.mist">End Date</Field.Label>
            <DatePicker
              placeholder="End date"
              value={endDate ? [parseDate(endDate)] : []}
              onValueChange={(details: DatePickerValueChangeDetails) => {
                const firstValue = details.value[0];
                if (firstValue) {
                  setEndDate(firstValue.toString().split('T')[0]);
                } else {
                  setEndDate('');
                }
              }}
            />
          </Field.Root>
        </HStack>
      </VStack>

      {/* Criteria */}
      <VStack gap={2} align="stretch">
        <HStack justify="space-between">
          <Text
            color="brand.matrix"
            fontSize="xs"
            fontFamily="mono"
            borderBottom="1px solid"
            borderColor="rgba(0, 255, 65, 0.2)"
            pb={1}
          >
            COMPLETION CRITERIA
          </Text>
          <Button variant="ghost" onClick={handleAddCriterion}>
            <LuPlus size={12} />
          </Button>
        </HStack>

        {criteria.map((criterion, index) => (
          <Box
            key={index}
            p={3}
            borderWidth="1px"
            borderColor="brand.matrix"
            borderRadius="4px"
            bg="rgba(0, 255, 65, 0.02)"
          >
            <VStack gap={2} align="stretch">
              <HStack justify="space-between">
                <Text color="text.mist" fontSize="xs" fontFamily="mono">
                  Criterion {index + 1}
                </Text>
                {criteria.length > 1 && (
                  <Button
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleRemoveCriterion(index)}
                  >
                    <LuTrash2 size={12} />
                  </Button>
                )}
              </HStack>

              <SelectField
                label="Behavior"
                value={criterion.behaviorId}
                onChange={(value) => handleCriterionChange(index, 'behaviorId', value)}
                options={definitions.map((d) => ({
                  label: `${d.icon ? d.icon + ' ' : ''}${d.name}`,
                  value: d.id,
                }))}
                placeholder="Select behavior..."
                required
                invalid={!criterion.behaviorId}
              />

              <Box
                p={2}
                borderWidth="1px"
                borderColor="rgba(0, 255, 65, 0.3)"
                borderRadius="4px"
                bg="rgba(0, 255, 65, 0.05)"
              >
                <HStack gap={1}>
                  <SelectField
                    label=""
                    value={criterion.period}
                    onChange={(value) => handleCriterionChange(index, 'period', value)}
                    options={periodOptions}
                    flex={1}
                    transformValue={(value) => {
                      if (
                        value === GoalPeriod.Daily ||
                        value === GoalPeriod.Weekly ||
                        value === GoalPeriod.Monthly
                      ) {
                        return value;
                      }
                      return GoalPeriod.Daily;
                    }}
                  />

                  <SelectField
                    label=""
                    value={criterion.metric}
                    onChange={(value) => handleCriterionChange(index, 'metric', value)}
                    options={metricOptions}
                    flex={1}
                    transformValue={(value) => {
                      if (
                        value === GoalMetric.Count ||
                        value === GoalMetric.Sum ||
                        value === GoalMetric.Avg
                      ) {
                        return value;
                      }
                      return GoalMetric.Count;
                    }}
                  />

                  <SelectField
                    label=""
                    value={criterion.operator}
                    onChange={(value) => handleCriterionChange(index, 'operator', value)}
                    options={operatorOptions}
                    flex={1}
                    transformValue={(value) => {
                      if (
                        value === GoalOperator.GreaterThan ||
                        value === GoalOperator.GreaterThanOrEqual ||
                        value === GoalOperator.LessThan ||
                        value === GoalOperator.LessThanOrEqual ||
                        value === GoalOperator.Equal
                      ) {
                        return value;
                      }
                      return GoalOperator.Equal;
                    }}
                  />

                  <InputField
                    label=""
                    value={criterion.value}
                    onChange={(value) => handleCriterionChange(index, 'value', value)}
                    type="number"
                    min="0"
                    step={0.01}
                    flex={1}
                  />
                </HStack>
              </Box>

              <InputField
                label="Description"
                value={criterion.description}
                onChange={(value) => handleCriterionChange(index, 'description', value)}
                type="text"
                placeholder="e.g., Run at least 5km daily"
                required
                invalid={!criterion.description.trim()}
              />
            </VStack>
          </Box>
        ))}
      </VStack>

      <FormButtonGroup
        onCancel={onCancel || (() => {})}
        onSubmit={handleSubmit}
        isLoading={saving}
        disabled={!isFormValid}
      />
    </VStack>
  );
}
