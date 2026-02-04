'use client';

import { Badge } from '@chakra-ui/react';
import type { Goal } from '@/types/goal-client';

interface GoalStatusBadgeProps {
  status: Goal['status'];
}

export function GoalStatusBadge({ status }: GoalStatusBadgeProps) {
  const statusConfig = {
    active: {
      colorScheme: 'success' as const,
      text: 'Active',
    },
    completed: {
      colorScheme: 'success' as const,
      text: 'Completed',
    },
    abandoned: {
      colorScheme: 'neutral' as const,
      text: 'Abandoned',
    },
  };

  const config = statusConfig[status];

  return <Badge colorScheme={config.colorScheme}>{config.text}</Badge>;
}
