'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Heading, Button, HStack, VStack, Text, Skeleton } from '@chakra-ui/react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { GoalProgressRing } from '@/components/dashboard/goal-progress-ring';
import { GoalStatusBadge } from '@/components/goals';
import { useGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/use-goals';
import type { GoalProgress as DashboardGoalProgress } from '@/types/dashboard-client';
import type { Goal } from '@/types/goal-client';

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { goal, isLoading, error } = useGoal(resolvedParams.id);
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
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(goal.id);
      router.push('/goals');
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <Container maxW="1400px" py={6}>
          <Skeleton height="400px" borderRadius="4px" />
        </Container>
      </AuthenticatedLayout>
    );
  }

  if (error || !goal) {
    return (
      <AuthenticatedLayout>
        <Container maxW="1400px" py={6}>
          <Box textAlign="center" p={8}>
            <Text color="text.mist" fontFamily="mono">
              {error || 'Goal Not Found'}
            </Text>
            <Button mt={4} onClick={() => router.push('/goals')}>
              Back to List
            </Button>
          </Box>
        </Container>
      </AuthenticatedLayout>
    );
  }

  const progress = (
    goal as Goal & {
      progress?: {
        current: number;
        target: number;
        progress: number;
        isCompleted: boolean;
        remainingDays?: number;
      };
    }
  ).progress;
  const progressData: DashboardGoalProgress = {
    id: goal.id,
    name: goal.name,
    progress: progress?.progress ?? 0,
    target: progress?.target ?? 0,
    current: progress?.current ?? 0,
    status: goal.status,
  };

  return (
    <AuthenticatedLayout>
      <Container maxW="1400px" py={6}>
        <VStack gap={6} align="stretch">
          {/* Page Header */}
          <HStack justify="space-between" align="center">
            <HStack gap={4}>
              <Button variant="ghost" onClick={() => router.push('/goals')}>
                ← Back
              </Button>
              <Heading fontSize="24px" color="text.neon" fontFamily="mono">
                Goal Details
              </Heading>
            </HStack>
            <HStack gap={2}>
              {goal.status === 'active' && (
                <>
                  <Button size="sm" onClick={handleMarkComplete} loading={isUpdating}>
                    Mark as Completed
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleAbandon} loading={isUpdating}>
                    Abandon Goal
                  </Button>
                </>
              )}
              <Button size="sm" colorScheme="red" onClick={handleDelete} loading={isDeleting}>
                Delete
              </Button>
            </HStack>
          </HStack>

          {/* Goal Detail Card */}
          <Box
            bg="bg.carbon"
            border="1px solid"
            borderColor="rgba(0, 255, 65, 0.3)"
            borderRadius="4px"
            p={6}
          >
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

              {/* Criteria */}
              {goal.criteria && goal.criteria.length > 0 && (
                <VStack align="flex-start" gap={2}>
                  <Heading fontSize="md" color="text.neon" fontFamily="mono">
                    Completion Criteria
                  </Heading>
                  <VStack align="flex-start" gap={2} w="full">
                    {goal.criteria.map((criterion, index) => (
                      <Box key={index} p={3} bg="bg.dark" borderRadius="4px" w="full">
                        <Text fontSize="sm" color="text.mist">
                          {criterion.description || `Criterion ${index + 1}`}
                        </Text>
                        <Text fontSize="xs" color="text.dim" fontFamily="mono" mt={1}>
                          Behavior: {criterion.behaviorId} | Metric: {criterion.metric} | Target:{' '}
                          {criterion.value} | Period: {criterion.period}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              )}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </AuthenticatedLayout>
  );
}
