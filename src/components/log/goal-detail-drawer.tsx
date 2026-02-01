'use client';

import { useState } from 'react';
import {
  Drawer,
  Portal,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Skeleton,
  Box,
} from '@chakra-ui/react';
import { GoalProgressRing } from '@/components/dashboard/goal-progress-ring';
import { GoalStatusBadge } from '@/components/goals';
import { GoalForm } from '@/components/forms';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/use-goals';
import { useBehaviorDefinitions } from '@/hooks/use-behavior-definitions';
import type { GoalProgress as DashboardGoalProgress } from '@/types/dashboard-client';

interface GoalDetailDrawerProps {
  goalId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function GoalDetailDrawer({ goalId, isOpen, onClose }: GoalDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const { definitions } = useBehaviorDefinitions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { goal, isLoading, error } = useGoal(goalId);
  const { updateGoal, isLoading: isUpdating } = useUpdateGoal();
  const { deleteGoal, isLoading: isDeleting } = useDeleteGoal();

  const handleMarkComplete = async () => {
    if (!goal) return;
    await updateGoal({ id: goal.id, updates: { status: 'completed' } });
  };

  const handleAbandon = async () => {
    if (!goal) return;
    await updateGoal({ id: goal.id, updates: { status: 'abandoned' } });
  };

  const handleDelete = async () => {
    if (!goal) return;
    await deleteGoal(goal.id);
    onClose();
  };

  const progress = goal?.progress;
  const progressData: DashboardGoalProgress | null = goal
    ? {
        id: goal.id,
        name: goal.name,
        progress: progress?.progress ?? 0,
        target: progress?.target ?? 0,
        current: progress?.current ?? 0,
        status: goal.status,
      }
    : null;

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(e) => (e.open ? undefined : onClose())}
      placement="end"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content width={{ base: 'full', md: '600px' }}>
            <Drawer.Header>
              <Drawer.Title>GOAL DETAILS</Drawer.Title>
            </Drawer.Header>

            <Drawer.Body>
              {activeTab === 'edit' && goal ? (
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
                    setActiveTab('view');
                    onClose();
                  }}
                  onCancel={() => setActiveTab('view')}
                />
              ) : (
                <>
                  {isLoading ? (
                    <VStack gap={4}>
                      <Skeleton height="200px" w="full" />
                      <Skeleton height="100px" w="full" />
                    </VStack>
                  ) : error || !goal ? (
                    <Box textAlign="center" p={8}>
                      <Text color="text.mist" fontFamily="mono">
                        {error || 'Goal Not Found'}
                      </Text>
                    </Box>
                  ) : (
                    <VStack gap={6} align="stretch">
                      {/* Goal Info */}
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

                      {/* Progress */}
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

                      {/* Criteria */}
                      {goal.criteria && goal.criteria.length > 0 && (
                        <VStack align="flex-start" gap={2}>
                          <Heading fontSize="md" color="text.neon" fontFamily="mono">
                            Completion Criteria
                          </Heading>
                          <VStack align="flex-start" gap={3} w="full">
                            {goal.criteria.map((criterion, index) => {
                              const behaviorDef = definitions.find(
                                (d) => d.id === criterion.behaviorId,
                              );
                              return (
                                <Box
                                  key={index}
                                  p={3}
                                  bg="bg.dark"
                                  borderRadius="4px"
                                  w="full"
                                  borderWidth="1px"
                                  borderColor="rgba(0, 255, 65, 0.2)"
                                >
                                  {criterion.description && (
                                    <Text fontSize="sm" color="text.neon" fontFamily="mono" mb={2}>
                                      {criterion.description}
                                    </Text>
                                  )}
                                  <VStack
                                    align="flex-start"
                                    gap={1}
                                    fontSize="xs"
                                    fontFamily="mono"
                                  >
                                    <Text color="text.mist">
                                      <Text as="span" color="brand.matrix">
                                        [BEHAVIOR]
                                      </Text>{' '}
                                      {behaviorDef?.name || criterion.behaviorId}
                                    </Text>
                                    <Text color="text.mist">
                                      <Text as="span" color="brand.matrix">
                                        [METRIC]
                                      </Text>{' '}
                                      {criterion.metric}
                                    </Text>
                                    <Text color="text.mist">
                                      <Text as="span" color="brand.matrix">
                                        [TARGET]
                                      </Text>{' '}
                                      {criterion.value}
                                    </Text>
                                    <Text color="text.mist">
                                      <Text as="span" color="brand.matrix">
                                        [PERIOD]
                                      </Text>{' '}
                                      {criterion.period}
                                    </Text>
                                  </VStack>
                                </Box>
                              );
                            })}
                          </VStack>
                        </VStack>
                      )}

                      {/* Actions */}
                      <HStack gap={2} pt={4}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab('edit')}
                          flex={1}
                        >
                          Edit
                        </Button>
                        {goal.status === 'active' && (
                          <>
                            <Button
                              size="sm"
                              onClick={handleMarkComplete}
                              loading={isUpdating}
                              flex={1}
                            >
                              Mark as Completed
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowAbandonDialog(true)}
                              loading={isUpdating}
                              flex={1}
                            >
                              Abandon Goal
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => setShowDeleteDialog(true)}
                          loading={isDeleting}
                          flex={1}
                        >
                          Delete
                        </Button>
                      </HStack>
                    </VStack>
                  )}
                </>
              )}
            </Drawer.Body>

            <Drawer.CloseTrigger />
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>

      <ConfirmDialog
        isOpen={showAbandonDialog}
        onClose={() => setShowAbandonDialog(false)}
        onConfirm={handleAbandon}
        title="Abandon Goal"
        message="Are you sure you want to abandon this goal? This action cannot be undone."
        confirmLabel="Abandon"
        cancelLabel="Cancel"
        confirmColorScheme="green"
        isLoading={isUpdating}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColorScheme="red"
        isLoading={isDeleting}
      />
    </Drawer.Root>
  );
}
