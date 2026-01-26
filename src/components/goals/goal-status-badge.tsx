'use client';

import { Box, Text } from '@chakra-ui/react';
import type { Goal } from '@/types/goal-client';

interface GoalStatusBadgeProps {
  status: Goal['status'];
}

export function GoalStatusBadge({ status }: GoalStatusBadgeProps) {
  const statusConfig = {
    active: {
      bg: 'rgba(0, 255, 65, 0.2)',
      color: '#00FF41',
      border: '#00FF41',
      text: '进行中',
    },
    completed: {
      bg: 'rgba(0, 255, 65, 0.3)',
      color: '#00FF41',
      border: '#00FF41',
      text: '已完成',
    },
    abandoned: {
      bg: 'rgba(136, 136, 136, 0.2)',
      color: '#888888',
      border: '#888888',
      text: '已放弃',
    },
  };

  const config = statusConfig[status];

  return (
    <Box
      px={2}
      py={1}
      borderRadius="4px"
      bg={config.bg}
      border="1px solid"
      borderColor={config.border}
      display="inline-block"
    >
      <Text fontSize="xs" color={config.color} fontFamily="mono" fontWeight="bold">
        {config.text}
      </Text>
    </Box>
  );
}

