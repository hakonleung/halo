'use client';

import { Box, Text, HStack, VStack } from '@chakra-ui/react';
import { GoalProgressRing } from '@/components/dashboard/goal-progress-ring';
import { GoalStatusBadge } from './goal-status-badge';
import type { Goal } from '@/types/goal-client';
import type { GoalProgress as DashboardGoalProgress } from '@/types/dashboard-client';

interface GoalCardProps {
  goal: Goal;
  progress?: { current: number; target: number; progress: number; isCompleted: boolean };
  onClick?: () => void;
}

export function GoalCard({ goal, progress, onClick }: GoalCardProps) {
  const progressData: DashboardGoalProgress = {
    id: goal.id,
    name: goal.name,
    progress: progress?.progress ?? 0,
    target: progress?.target ?? 0,
    current: progress?.current ?? 0,
    status: goal.status,
  };

  return (
    <Box
      bg="bg.carbon"
      border="1px solid"
      borderColor={
        goal.status === 'active'
          ? 'rgba(0, 255, 65, 0.3)'
          : goal.status === 'completed'
            ? 'rgba(0, 255, 65, 0.2)'
            : 'rgba(136, 136, 136, 0.3)'
      }
      borderRadius="4px"
      p={4}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      transition="all 150ms ease-out"
      _hover={
        onClick
          ? {
              borderColor: 'rgba(0, 255, 65, 0.5)',
              boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)',
            }
          : undefined
      }
    >
      <HStack justify="space-between" align="flex-start" mb={3}>
        <VStack align="flex-start" gap={1} flex={1}>
          <Text fontSize="lg" fontWeight="bold" color="text.neon" fontFamily="mono">
            {goal.name}
          </Text>
          {goal.description && (
            <Text
              fontSize="sm"
              color="text.mist"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {goal.description}
            </Text>
          )}
        </VStack>
        <GoalStatusBadge status={goal.status} />
      </HStack>

      <HStack gap={2} mb={3} fontSize="xs" color="text.mist" fontFamily="mono">
        <Text>分类: {goal.category}</Text>
        <Text>|</Text>
        <Text>开始: {new Date(goal.startDate).toLocaleDateString('zh-CN')}</Text>
      </HStack>

      <HStack align="center" gap={4}>
        <GoalProgressRing goal={progressData} size="sm" />
        <VStack align="flex-start" gap={0} flex={1}>
          <Text fontSize="md" fontWeight="bold" color="text.neon">
            {progress?.current ?? 0} / {progress?.target ?? 0}
          </Text>
          {goal.endDate && (
            <Text fontSize="xs" color="text.mist">
              剩余:{' '}
              {Math.ceil((new Date(goal.endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))}{' '}
              天
            </Text>
          )}
        </VStack>
      </HStack>
    </Box>
  );
}
