'use client';

import { Box, Text, SimpleGrid, Skeleton } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { GoalProgressRing } from './goal-progress-ring';
import type { GoalProgress } from '@/types/dashboard-client';

interface GoalProgressSectionProps {
  loading?: boolean;
}

async function fetchGoals(): Promise<GoalProgress[]> {
  const res = await fetch('/api/goals');
  if (!res.ok) throw new Error('Failed to fetch goals');
  const json = await res.json();

  // Transform to GoalProgress format
  return (json.data || []).map((goal: Record<string, unknown>) => ({
    id: goal.id as string,
    name: goal.name as string,
    progress: 50, // Would need actual progress calculation
    target: 100,
    current: 50,
    status: goal.status as 'active' | 'completed' | 'abandoned',
  }));
}

export function GoalProgressSection({ loading: externalLoading }: GoalProgressSectionProps) {
  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', 'progress'],
    queryFn: fetchGoals,
    staleTime: 60 * 1000,
  });

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

  const activeGoals = goals?.filter((g) => g.status === 'active') || [];

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
