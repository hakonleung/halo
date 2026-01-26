'use client';

import { Box, Text, Skeleton, HStack, VStack } from '@chakra-ui/react';
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
      <Box
        bg="bg.carbon"
        border="1px solid"
        borderColor="whiteAlpha.200"
        borderRadius="4px"
        p={4}
        h="180px"
      >
        <Skeleton height="16px" width="60%" mb={4} />
        <Skeleton height="48px" width="40%" mb={4} />
        <Skeleton height="14px" width="50%" />
      </Box>
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
    <Box
      bg="bg.carbon"
      border="1px solid"
      borderColor="rgba(0, 255, 65, 0.3)"
      borderRadius="4px"
      p={4}
      h="180px"
      cursor={onClick ? 'pointer' : 'default'}
      transition="all 0.15s ease"
      _hover={
        onClick
          ? {
              borderColor: 'brand.matrix',
              boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)',
              transform: 'translateY(-2px)',
            }
          : undefined
      }
      onClick={onClick}
    >
      <VStack align="stretch" h="full" gap={0}>
        <Text
          fontSize="sm"
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
              fontSize="4xl"
              fontWeight="bold"
              fontFamily="mono"
              color="brand.matrix"
              textShadow="0 0 10px currentColor"
              lineHeight={1}
            >
              {value}
            </Text>
            {suffix && (
              <Text fontSize="lg" color="text.mist" fontFamily="mono">
                {suffix}
              </Text>
            )}
          </HStack>
        </Box>

        {trend && (
          <HStack gap={1} color={trendColor}>
            <TrendIcon size={14} weight="bold" />
            <Text fontSize="sm" fontFamily="mono">
              {trend.value}
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}
