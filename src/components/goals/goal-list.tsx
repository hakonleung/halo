'use client';

import { Box, SimpleGrid, Skeleton, Text, VStack } from '@chakra-ui/react';
import { GoalCard } from './goal-card';
import type { Goal } from '@/types/goal-client';

interface GoalListProps {
  goals: Goal[];
  progressMap?: Map<string, { current: number; target: number; progress: number; isCompleted: boolean }>;
  isLoading?: boolean;
  onGoalClick?: (goalId: string) => void;
}

export function GoalList({ goals, progressMap, isLoading, onGoalClick }: GoalListProps) {
  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height="200px" borderRadius="4px" />
        ))}
      </SimpleGrid>
    );
  }

  if (goals.length === 0) {
    return (
      <Box
        bg="bg.carbon"
        border="1px dashed"
        borderColor="rgba(0, 255, 65, 0.3)"
        borderRadius="4px"
        p={8}
        textAlign="center"
      >
        <VStack gap={2}>
          <Text color="text.mist" fontFamily="mono" fontSize="lg">
            暂无目标
          </Text>
          <Text color="brand.matrix" fontFamily="mono" fontSize="sm">
            创建你的第一个目标
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
      {goals.map((goal) => {
        const progress = progressMap?.get(goal.id);
        return (
          <GoalCard
            key={goal.id}
            goal={goal}
            progress={progress}
            onClick={() => onGoalClick?.(goal.id)}
          />
        );
      })}
    </SimpleGrid>
  );
}

