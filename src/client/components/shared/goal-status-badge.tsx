'use client';

import { Badge } from '@chakra-ui/react';

import type { Goal } from '@/client/types/goal-client';

export function GoalStatusBadge({ status }: { status: Goal['status'] }) {
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
