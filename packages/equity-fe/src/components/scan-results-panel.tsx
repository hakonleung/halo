'use client';

import { Box, HStack, Text, Spinner } from '@chakra-ui/react';

import type { ScanMatch } from '../types';
import { StrategyType, STRATEGY_META } from '../types';

interface Props {
  strategy: StrategyType;
  matches: ScanMatch[];
  isLoading: boolean;
  statusMsg: string;
}

function primaryMetric(strategy: StrategyType, m: ScanMatch): string {
  switch (strategy) {
    case StrategyType.FindBreakout:
      return m.breakoutDirection === 'up'
        ? '↑ 上轨突破'
        : m.breakoutDirection === 'down'
          ? '↓ 下轨突破'
          : '⏸ 蓄势';
    case StrategyType.FindVolumePriceDivergence:
      return m.divergenceType?.replace(/_/g, ' ') ?? '';
    case StrategyType.FindMultiTimeframe:
      return m.direction === 'bullish' ? '多头共振' : '空头共振';
    case StrategyType.FindMomentumReversal:
      return `${m.direction === 'top' ? '顶部' : '底部'} ${m.signalCount ?? 0}信号`;
    case StrategyType.FindChartPattern:
      return m.pattern?.replace(/_/g, ' ') ?? '';
    default:
      return '';
  }
}

function metricValue(strategy: StrategyType, m: ScanMatch): string {
  switch (strategy) {
    case StrategyType.FindBreakout:
      return typeof m.squeezeDays === 'number' ? `压缩 ${m.squeezeDays}d` : '';
    case StrategyType.FindVolumePriceDivergence:
      return typeof m.divergenceStrength === 'number'
        ? `强度 ${(m.divergenceStrength * 100).toFixed(0)}%`
        : '';
    case StrategyType.FindMultiTimeframe:
      return typeof m.resonanceScore === 'number'
        ? `共振 ${(m.resonanceScore * 100).toFixed(0)}%`
        : '';
    case StrategyType.FindMomentumReversal:
      return typeof m.trendScore === 'number'
        ? `趋势 ${m.trendScore > 0 ? '+' : ''}${(m.trendScore * 100).toFixed(2)}`
        : '';
    case StrategyType.FindChartPattern:
      return typeof m.confidence === 'number' ? `置信 ${m.confidence}` : '';
    default:
      return '';
  }
}

export function ScanResultsPanel({ strategy, matches, isLoading, statusMsg }: Props) {
  const meta = STRATEGY_META[strategy];

  return (
    <Box>
      <HStack justify="space-between" mb={2}>
        <HStack gap={2}>
          <Text fontFamily="mono" fontSize="xs" color="brand.matrix">
            {meta.label}
          </Text>
          {isLoading && <Spinner size="xs" color="brand.matrix" />}
          {!isLoading && matches.length > 0 && (
            <Text fontFamily="mono" fontSize="xs" color="#555">
              {matches.length} 只
            </Text>
          )}
        </HStack>
        {statusMsg && (
          <Text fontFamily="mono" fontSize="10px" color="#555" maxW="60%" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {statusMsg}
          </Text>
        )}
      </HStack>

      {isLoading && matches.length === 0 && (
        <Box py={6} textAlign="center">
          <Text fontFamily="mono" fontSize="xs" color="#555">
            {statusMsg || '扫描中...'}
          </Text>
        </Box>
      )}

      {matches.map((m, i) => (
        <Box key={`${m.code}-${i}`}
          px={3} py={2} mb={1}
          bg="rgba(255,255,255,0.02)"
          border="1px solid rgba(255,255,255,0.06)"
          borderRadius="4px"
          _hover={{ borderColor: 'rgba(0,255,65,0.2)', bg: 'rgba(0,255,65,0.03)' }}
          transition="all 0.1s">
          <HStack justify="space-between">
            <HStack gap={2}>
              <Text fontFamily="mono" fontSize="xs" color="brand.matrix">
                {m.code}
              </Text>
              <Text fontFamily="mono" fontSize="xs" color="#888">
                {m.name}
              </Text>
            </HStack>
            <HStack gap={3}>
              <Text fontFamily="mono" fontSize="10px" color="#00D4FF">
                {primaryMetric(strategy, m)}
              </Text>
              <Text fontFamily="mono" fontSize="10px" color="#555">
                {metricValue(strategy, m)}
              </Text>
              {m.latestDate && (
                <Text fontFamily="mono" fontSize="10px" color="#444">
                  {m.latestDate}
                </Text>
              )}
            </HStack>
          </HStack>
          {m.signals && m.signals.length > 0 && (
            <HStack gap={1} mt={1} flexWrap="wrap">
              {m.signals.map((s) => (
                <Text key={s} fontFamily="mono" fontSize="9px" px={1.5} py={0.5}
                  border="1px solid rgba(255,107,53,0.3)"
                  color="#FF6B35" borderRadius="2px">
                  {s.replace(/_/g, ' ')}
                </Text>
              ))}
            </HStack>
          )}
        </Box>
      ))}

      {!isLoading && matches.length === 0 && (
        <Box py={4} textAlign="center">
          <Text fontFamily="mono" fontSize="xs" color="#444">无符合条件的股票</Text>
        </Box>
      )}
    </Box>
  );
}
