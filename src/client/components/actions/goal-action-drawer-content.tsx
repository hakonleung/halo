'use client';

import { VStack, HStack, Text, Heading, Button, Skeleton, Box, Badge } from '@chakra-ui/react';

import { useActionGuard } from '@/client/hooks/use-action-guard';
import { useBehaviorDefinitions } from '@/client/hooks/use-behavior-definitions';
import { useGoal, useUpdateGoal, useDeleteGoal } from '@/client/hooks/use-goals';
import { useUnifiedActionDrawerSync } from '@/client/hooks/use-unified-action-drawer-sync';
import { useUnifiedActionDrawerStore } from '@/client/store/unified-action-drawer-store';
import { formatDate } from '@/client/utils/date-format';

import { GoalStatusBadge } from '../shared/goal-status-badge';

import { CriteriaDetail } from './fields/criteria-detail';
import { FormButtonGroup } from './forms/form-button-group';
import { GoalForm } from './forms/goal-form';

import type { GoalProgress as DashboardGoalProgress } from '@/client/types/dashboard-client';

export function GoalActionDrawerContent({
  actionDataId,
  onClose,
}: {
  actionDataId: string;
  onClose: () => void;
}) {
  const { isEditMode, setEditMode } = useUnifiedActionDrawerStore();
  const { goal, isLoading, error } = useGoal(actionDataId);
  const { definitions } = useBehaviorDefinitions();
  const { updateGoal, isLoading: isUpdatingGoal } = useUpdateGoal();
  const { deleteGoal, isLoading: isDeletingGoal } = useDeleteGoal();
  const { closeDrawer } = useUnifiedActionDrawerSync();
  const { guard } = useActionGuard();

  const handleDelete = guard({
    title: 'Delete Goal',
    message: 'Are you sure you want to delete this goal? This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    confirmColorScheme: 'red',
    isLoading: isDeletingGoal,
    onConfirm: async () => {
      await deleteGoal(actionDataId);
      closeDrawer();
    },
  });

  const handleMarkComplete = guard({
    title: 'Mark as Completed',
    message: 'Are you sure you want to mark this goal as completed?',
    confirmLabel: 'Mark as Completed',
    cancelLabel: 'Cancel',
    confirmColorScheme: 'green',
    isLoading: isUpdatingGoal,
    onConfirm: async () => {
      await updateGoal({ id: actionDataId, updates: { status: 'completed' } });
    },
  });

  const handleAbandon = guard({
    title: 'Abandon Goal',
    message: 'Are you sure you want to abandon this goal? This action cannot be undone.',
    confirmLabel: 'Abandon',
    cancelLabel: 'Cancel',
    confirmColorScheme: 'green',
    isLoading: isUpdatingGoal,
    onConfirm: async () => {
      await updateGoal({ id: actionDataId, updates: { status: 'abandoned' } });
    },
  });

  if (isEditMode) {
    if (!goal) return null;
    return (
      <GoalForm
        key={goal.id}
        initialData={goal}
        onSuccess={() => {
          setEditMode(false);
          onClose();
        }}
        onCancel={() => setEditMode(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <VStack gap={4}>
        <Skeleton height="200px" w="full" />
        <Skeleton height="100px" w="full" />
      </VStack>
    );
  }

  if (error || !goal) {
    return (
      <Box textAlign="center" p={8}>
        <Text color="text.mist" fontFamily="mono">
          {error || 'Goal Not Found'}
        </Text>
      </Box>
    );
  }

  const progress = goal.progress;
  const progressData: DashboardGoalProgress | null = {
    id: goal.id,
    name: goal.name,
    progress: progress?.progress ?? 0,
    target: progress?.target ?? 0,
    current: progress?.current ?? 0,
    status: goal.status,
  };

  return (
    <VStack gap={6} align="stretch">
      <VStack align="flex-start" gap={2}>
        <HStack justify="space-between" w="full">
          <Heading fontSize="24px" color="text.neon" fontFamily="mono">
            {goal.name}
          </Heading>
          <GoalStatusBadge status={goal.status} />
        </HStack>
        {goal.description && <Text color="text.mist">{goal.description}</Text>}
        <HStack gap={4} fontSize="sm" color="text.mist" fontFamily="mono" flexWrap="wrap">
          <Badge colorPalette="green" variant="outline">
            {goal.category}
          </Badge>
          <Text>Start: {formatDate(goal.startDate)}</Text>
          {goal.endDate && <Text>End: {formatDate(goal.endDate)}</Text>}
        </HStack>
      </VStack>

      {progressData && (
        <VStack align="stretch" gap={2}>
          <HStack justify="space-between" fontSize="sm" color="text.mist" fontFamily="mono">
            <Text>
              {progress?.current ?? 0} / {progress?.target ?? 0}
            </Text>
            <Text>{progress?.progress ?? 0}%</Text>
          </HStack>
          <Box
            h="8px"
            bg="rgba(0, 255, 65, 0.1)"
            borderRadius="4px"
            overflow="hidden"
            position="relative"
          >
            <Box
              h="100%"
              bg="brand.matrix"
              borderRadius="4px"
              width={`${Math.min(progress?.progress ?? 0, 100)}%`}
              transition="width 0.3s ease"
            />
          </Box>
          {progress?.remainingDays !== undefined && (
            <Text fontSize="xs" color="text.dim" fontFamily="mono">
              Remaining: {progress.remainingDays} days
            </Text>
          )}
        </VStack>
      )}

      <CriteriaDetail criteria={goal.criteria} definitions={definitions} />

      <FormButtonGroup
        onCancel={() => {}}
        onSubmit={() => {}}
        showEdit={!isEditMode}
        onEdit={() => setEditMode(true)}
      />
      <HStack gap={2} pt={2}>
        {goal.status === 'active' && (
          <>
            <Button onClick={handleMarkComplete} loading={isUpdatingGoal} flex={1}>
              Mark as Completed
            </Button>
            <Button variant="outline" onClick={handleAbandon} loading={isUpdatingGoal} flex={1}>
              Abandon Goal
            </Button>
          </>
        )}
        <Button colorScheme="red" onClick={handleDelete} loading={isDeletingGoal} flex={1}>
          Delete
        </Button>
      </HStack>
    </VStack>
  );
}
