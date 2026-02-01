'use client';

import { Box, Text, Skeleton, HStack, VStack, Card } from '@chakra-ui/react';
import { ArrowUp, ArrowDown, Minus } from 'phosphor-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  suffix?: string;
  loading?: boolean;
  onClick?: () => void;
}

export function StatsCard({ title, value, trend, suffix, loading, onClick }: StatsCardProps) {
  if (loading) {
    return (
      <Card.Root size="sm" h="120px">
        <Card.Body>
          <Skeleton height="12px" width="60%" mb={2} />
          <Skeleton height="32px" width="40%" mb={2} />
          <Skeleton height="12px" width="50%" />
        </Card.Body>
      </Card.Root>
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
    <Card.Root
      size="sm"
      h="120px"
      cursor={onClick ? 'pointer' : 'default'}
      transition="all 0.15s ease"
      _hover={
        onClick
          ? {
              transform: 'translateY(-2px)',
            }
          : undefined
      }
      onClick={onClick}
    >
      <Card.Body>
        <VStack align="stretch" h="full" gap={0}>
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
      </Card.Body>
    </Card.Root>
  );
}
