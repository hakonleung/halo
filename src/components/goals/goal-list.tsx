'use client';

import { SimpleGrid, Skeleton, Text, VStack, Card } from '@chakra-ui/react';
import { GoalCard } from './goal-card';
import type { Goal } from '@/types/goal-client';

interface GoalListProps {
  goals: Goal[];
  progressMap?: Map<
    string,
    { current: number; target: number; progress: number; isCompleted: boolean }
  >;
  isLoading?: boolean;
}

export function GoalList({ goals, progressMap, isLoading }: GoalListProps) {
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
      <Card.Root size="lg" borderStyle="dashed">
        <Card.Body textAlign="center">
          <VStack gap={2}>
            <Text color="text.mist" fontFamily="mono" fontSize="lg">
              No Goals
            </Text>
            <Text color="brand.matrix" fontFamily="mono" fontSize="sm">
              Create Your First Goal
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
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
            onClick={() => {
              // Use URL query instead of navigation
              const url = new URL(window.location.href);
              url.searchParams.set('goal', goal.id);
              window.history.pushState({}, '', url.toString());
              window.dispatchEvent(new Event('popstate'));
            }}
          />
        );
      })}
    </SimpleGrid>
  );
}
