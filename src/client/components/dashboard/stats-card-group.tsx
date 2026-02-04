'use client';

import { SimpleGrid, Card, Skeleton, Box, Text, HStack, VStack } from '@chakra-ui/react';
import { ArrowUp, ArrowDown, Minus } from 'phosphor-react';
import type { DashboardStats } from '@/client/types/dashboard-client';

interface StatsCardGroupProps {
  stats: DashboardStats | undefined;
  loading?: boolean;
}

function StatItem({
  title,
  value,
  trend,
  suffix,
  loading,
}: {
  title: string;
  value: number | string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  suffix?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <VStack align="stretch" h="100px" gap={2}>
        <Skeleton height="12px" width="60%" />
        <Skeleton height="32px" width="40%" />
        <Skeleton height="12px" width="50%" />
      </VStack>
    );
  }

  const TrendIcon =
    trend?.direction === 'up' ? ArrowUp : trend?.direction === 'down' ? ArrowDown : Minus;
  const trendColor =
    trend?.direction === 'up'
      ? 'brand.matrix'
      : trend?.direction === 'down'
        ? 'brand.alert'
        : 'text.mist';

  return (
    <VStack align="stretch" h="100px" gap={0}>
      <Text
        fontSize="xs"
        color="text.mist"
        fontFamily="mono"
        textTransform="uppercase"
        letterSpacing="wider"
      >
        {title}
      </Text>

      <Box flex={1} display="flex" alignItems="center">
        <HStack gap={2} align="baseline">
          <Text
            fontSize="2xl"
            fontWeight="bold"
            fontFamily="mono"
            color="brand.matrix"
            textShadow="0 0 10px currentColor"
            lineHeight={1}
          >
            {value}
          </Text>
          {suffix && (
            <Text fontSize="sm" color="text.mist" fontFamily="mono">
              {suffix}
            </Text>
          )}
        </HStack>
      </Box>

      {trend && (
        <HStack gap={1} color={trendColor}>
          <TrendIcon size={12} weight="bold" />
          <Text fontSize="xs" fontFamily="mono">
            {trend.value}
          </Text>
        </HStack>
      )}
    </VStack>
  );
}

export function StatsCardGroup({ stats, loading }: StatsCardGroupProps) {
  return (
    <Card.Root>
      <Card.Body>
        <SimpleGrid columns={{ base: 2, lg: 4 }} gap={{ base: 2, md: 3 }}>
          <StatItem title="Today's Records" value={stats?.today.total ?? 0} loading={loading} />
          <StatItem
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
          <StatItem
            title="Goal Completion Rate"
            value={stats?.goalRate.overall ?? 0}
            suffix="%"
            trend={
              stats?.goalRate.change
                ? {
                    direction:
                      stats.goalRate.change > 0
                        ? 'up'
                        : stats.goalRate.change < 0
                          ? 'down'
                          : 'neutral',
                    value: `${stats.goalRate.change > 0 ? '+' : ''}${stats.goalRate.change}% vs Last Week`,
                  }
                : undefined
            }
            loading={loading}
          />
          <StatItem
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
      </Card.Body>
    </Card.Root>
  );
}
