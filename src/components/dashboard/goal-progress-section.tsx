'use client';

import { Box, Text, SimpleGrid, Skeleton } from '@chakra-ui/react';
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
      <Box
        bg="bg.carbon"
        border="1px solid"
        borderColor="rgba(0, 255, 65, 0.3)"
        borderRadius="4px"
        p={4}
      >
        <Skeleton height="16px" width="100px" mb={4} />
        <SimpleGrid columns={2} gap={4}>
          <Skeleton height="100px" borderRadius="full" />
          <Skeleton height="100px" borderRadius="full" />
        </SimpleGrid>
      </Box>
    );
  }

  const activeGoals = goalProgressList.filter((g) => g.status === 'active');

  if (activeGoals.length === 0) {
    return (
      <Box
        bg="bg.carbon"
        border="1px dashed"
        borderColor="rgba(0, 255, 65, 0.3)"
        borderRadius="4px"
        p={4}
        h="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        gap={2}
      >
        <Text color="text.mist" fontFamily="mono">
          No Active Goals
        </Text>
        <Text color="brand.matrix" fontFamily="mono" fontSize="sm">
          Create Your First Goal
        </Text>
      </Box>
    );
  }

  return (
    <Box
      bg="bg.carbon"
      border="1px solid"
      borderColor="rgba(0, 255, 65, 0.3)"
      borderRadius="4px"
      p={4}
    >
      <Text fontSize="md" color="text.neon" fontFamily="mono" mb={4}>
        Goal Progress
      </Text>
      <SimpleGrid columns={{ base: 2, md: 2 }} gap={4} justifyItems="center">
        {activeGoals.slice(0, 4).map((goal) => (
          <GoalProgressRing key={goal.id} goal={goal} size="md" />
        ))}
      </SimpleGrid>
    </Box>
  );
}
