'use client';

import { Text, SimpleGrid, Skeleton, Card } from '@chakra-ui/react';
import { useGoals } from '@/hooks/use-goals';
import { GoalProgressRing } from './goal-progress-ring';
import type { GoalProgress } from '@/types/dashboard-client';
import { useMemo } from 'react';

interface GoalProgressSectionProps {
  loading?: boolean;
}

export function GoalProgressSection({ loading: externalLoading }: GoalProgressSectionProps) {
  const { goals, isLoading } = useGoals();

  // Transform goals to GoalProgress format
  const goalProgressList = useMemo<GoalProgress[]>(() => {
    return goals.map((goal) => {
      // For now, use placeholder values - actual progress calculation would need goal progress API
      // This should ideally come from the goal detail endpoint with progress data
      return {
        id: goal.id,
        name: goal.name,
        progress: 50, // Would need actual progress calculation from goal.progress
        target: 100,
        current: 50,
        status: goal.status,
      };
    });
  }, [goals]);

  const loading = externalLoading || isLoading;

  if (loading) {
    return (
      <Card.Root size="sm">
        <Card.Body>
          <Skeleton height="14px" width="100px" mb={2} />
          <SimpleGrid columns={2} gap={3}>
            <Skeleton height="80px" borderRadius="full" />
            <Skeleton height="80px" borderRadius="full" />
          </SimpleGrid>
        </Card.Body>
      </Card.Root>
    );
  }

  const activeGoals = goalProgressList.filter((g) => g.status === 'active');

  if (activeGoals.length === 0) {
    return (
      <Card.Root size="sm" borderStyle="dashed">
        <Card.Body
          h="160px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap={2}
        >
          <Text color="text.mist" fontFamily="mono" fontSize="sm">
            No Active Goals
          </Text>
          <Text color="brand.matrix" fontFamily="mono" fontSize="xs">
            Create Your First Goal
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root size="sm">
      <Card.Body>
        <Text fontSize="sm" color="text.neon" fontFamily="mono" mb={2}>
          Goal Progress
        </Text>
        <SimpleGrid columns={{ base: 2, md: 2 }} gap={3} justifyItems="center">
          {activeGoals.slice(0, 4).map((goal) => (
            <GoalProgressRing key={goal.id} goal={goal} size="sm" />
          ))}
        </SimpleGrid>
      </Card.Body>
    </Card.Root>
  );
}
