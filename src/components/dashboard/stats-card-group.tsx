'use client';

import { SimpleGrid } from '@chakra-ui/react';
import { StatsCard } from './stats-card';
import type { DashboardStats } from '@/types/dashboard-client';

interface StatsCardGroupProps {
  stats: DashboardStats | undefined;
  loading?: boolean;
}

export function StatsCardGroup({ stats, loading }: StatsCardGroupProps) {
  return (
    <SimpleGrid columns={{ base: 2, lg: 4 }} gap={{ base: 2, md: 4 }}>
      <StatsCard title="Today's Records" value={stats?.today.total ?? 0} loading={loading} />
      <StatsCard
        title="Active Streak"
        value={stats?.streak.current ?? 0}
        suffix="days"
        trend={
          stats?.streak.current && stats.streak.current >= 7
            ? { direction: 'up', value: '🔥 Keep Going' }
            : undefined
        }
        loading={loading}
      />
      <StatsCard
        title="Goal Completion Rate"
        value={stats?.goalRate.overall ?? 0}
        suffix="%"
        trend={
          stats?.goalRate.change
            ? {
                direction:
                  stats.goalRate.change > 0 ? 'up' : stats.goalRate.change < 0 ? 'down' : 'neutral',
                value: `${stats.goalRate.change > 0 ? '+' : ''}${stats.goalRate.change}% vs Last Week`,
              }
            : undefined
        }
        loading={loading}
      />
      <StatsCard
        title="This Week vs Last Week"
        value={
          stats?.weekCompare.change
            ? `${stats.weekCompare.change > 0 ? '+' : ''}${stats.weekCompare.change}%`
            : '0%'
        }
        trend={
          stats?.weekCompare.change
            ? {
                direction:
                  stats.weekCompare.change > 0
                    ? 'up'
                    : stats.weekCompare.change < 0
                      ? 'down'
                      : 'neutral',
                value: `${stats.weekCompare.thisWeek} / ${stats.weekCompare.lastWeek}`,
              }
            : undefined
        }
        loading={loading}
      />
    </SimpleGrid>
  );
}
