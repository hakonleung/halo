'use client';

import { VStack, HStack, Text, Heading, Button, Skeleton, Box } from '@chakra-ui/react';
import { GoalForm } from './forms/goal-form';
import { CriteriaDetail } from './fields/criteria-detail';
import { GoalProgressRing } from '@/components/dashboard/goal-progress-ring';
import { GoalStatusBadge } from '../../goals/goal-status-badge';
import { useGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/use-goals';
import { useBehaviorDefinitions } from '@/hooks/use-behavior-definitions';
import { useUnifiedActionDrawerStore } from '@/store/unified-action-drawer-store';
import { useActionGuard } from '@/hooks/use-action-guard';
import { useUnifiedActionDrawerSync } from '@/hooks/use-unified-action-drawer-sync';
import type { GoalProgress as DashboardGoalProgress } from '@/types/dashboard-client';

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
        <HStack gap={4} fontSize="sm" color="text.mist" fontFamily="mono">
          <Text>Category: {goal.category}</Text>
          <Text>|</Text>
          <Text>Start: {new Date(goal.startDate).toLocaleDateString('en-US')}</Text>
          {goal.endDate && (
            <>
              <Text>|</Text>
              <Text>End: {new Date(goal.endDate).toLocaleDateString('en-US')}</Text>
            </>
          )}
        </HStack>
      </VStack>

      {progressData && (
        <HStack align="center" gap={6}>
          <GoalProgressRing goal={progressData} size="lg" />
          <VStack align="flex-start" gap={1}>
            <Text fontSize="xl" fontWeight="bold" color="text.neon">
              {progress?.current ?? 0} / {progress?.target ?? 0}
            </Text>
            <Text fontSize="md" color="text.mist">
              Progress: {progress?.progress ?? 0}%
            </Text>
            {progress?.remainingDays !== undefined && (
              <Text fontSize="sm" color="text.mist">
                Remaining: {progress.remainingDays} days
              </Text>
            )}
          </VStack>
        </HStack>
      )}

      <CriteriaDetail criteria={goal.criteria} definitions={definitions} />

      <HStack gap={2} pt={4}>
        {goal.status === 'active' && (
          <>
            <Button size="sm" onClick={handleMarkComplete} loading={isUpdatingGoal} flex={1}>
              Mark as Completed
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAbandon}
              loading={isUpdatingGoal}
              flex={1}
            >
              Abandon Goal
            </Button>
          </>
        )}
        <Button
          size="sm"
          colorScheme="red"
          onClick={handleDelete}
          loading={isDeletingGoal}
          flex={1}
        >
          Delete
        </Button>
      </HStack>
    </VStack>
  );
}
