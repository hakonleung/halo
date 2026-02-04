'use client';

import { VStack, HStack, Text, Heading, Button, Skeleton, Box } from '@chakra-ui/react';
import { GoalForm } from './forms/goal-form';
import { CriteriaDetail } from './fields/criteria-detail';
import { GoalProgressRing } from '@/components/dashboard/goal-progress-ring';
import { GoalStatusBadge } from '../../goals/goal-status-badge';
import { useGoal } from '@/hooks/use-goals';
import { useBehaviorDefinitions } from '@/hooks/use-behavior-definitions';
import { useUnifiedActionDrawerStore } from '@/store/unified-action-drawer-store';
import type { GoalProgress as DashboardGoalProgress } from '@/types/dashboard-client';

interface GoalActionDrawerContentProps {
  actionDataId: string;
  onClose: () => void;
  onDelete: () => void;
  onAbandon: () => void;
  onMarkComplete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function GoalActionDrawerContent({
  actionDataId,
  onClose,
  onDelete,
  onAbandon,
  onMarkComplete,
  isUpdating,
  isDeleting,
}: GoalActionDrawerContentProps) {
  const { isEditMode, setEditMode } = useUnifiedActionDrawerStore();
  const { goal, isLoading, error } = useGoal(actionDataId);
  const { definitions } = useBehaviorDefinitions();

  const renderGoalView = () => {
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
              <Button size="sm" onClick={onMarkComplete} loading={isUpdating} flex={1}>
                Mark as Completed
              </Button>
              <Button size="sm" variant="outline" onClick={onAbandon} loading={isUpdating} flex={1}>
                Abandon Goal
              </Button>
            </>
          )}
          <Button size="sm" colorScheme="red" onClick={onDelete} loading={isDeleting} flex={1}>
            Delete
          </Button>
        </HStack>
      </VStack>
    );
  };

  const renderGoalEditMode = () => {
    if (!goal) return null;
    return (
      <GoalForm
        key={goal.id}
        initialData={{
          id: goal.id,
          name: goal.name,
          description: goal.description,
          category: goal.category,
          startDate: goal.startDate,
          endDate: goal.endDate,
          criteria: goal.criteria,
        }}
        onSuccess={() => {
          setEditMode(false);
          onClose();
        }}
        onCancel={() => setEditMode(false)}
      />
    );
  };

  if (isEditMode) {
    return renderGoalEditMode();
  }
  return renderGoalView();
}
