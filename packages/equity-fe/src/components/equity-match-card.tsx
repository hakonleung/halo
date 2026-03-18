'use client';

import { Box, Flex, HStack, Spinner, Text } from '@chakra-ui/react';
import { useMemo } from 'react';

import { useEquityDailyBars } from '../hooks';

import { EquityKlineMini } from './equity-kline-mini';

import type { PatternMatch } from '../types';

interface Props {
  match: PatternMatch;
  rank: number;
}

function simColor(s: number) {
  return s >= 0.9 ? '#00FF41' : s >= 0.7 ? '#00D4FF' : '#888888';
}

export function EquityMatchCard({ match, rank }: Props) {
  const { bars, isLoading } = useEquityDailyBars(match.code);

  const contextBars = useMemo(() => {
    if (!bars.length) return [];
    const startIdx = bars.findIndex((b) => b.trade_date >= match.startDate);
    if (startIdx === -1) return bars.slice(-60);
    let endIdx = startIdx;
    while (endIdx < bars.length - 1 && bars[endIdx].trade_date <= match.endDate) endIdx++;
    const pad = 15;
    return bars.slice(Math.max(0, startIdx - pad), Math.min(bars.length, endIdx + pad + 1));
  }, [bars, match.startDate, match.endDate]);

  return (
    <Box
      border="1px solid rgba(0,212,255,0.12)"
      borderRadius="4px"
      p={3}
      mb={2}
      bg="rgba(0,212,255,0.02)"
      _hover={{ borderColor: 'rgba(0,212,255,0.25)', bg: 'rgba(0,212,255,0.04)' }}
      transition="all 0.15s"
    >
      <HStack justify="space-between" mb={1}>
        <HStack gap={2}>
          <Text fontFamily="mono" fontSize="10px" color="#444" w="18px" textAlign="right">
            {rank}
          </Text>
          <Text fontFamily="mono" fontSize="sm" color="brand.matrix" fontWeight="bold">
            {match.code}
          </Text>
          <Text fontFamily="mono" fontSize="xs" color="#888">
            {match.name}
          </Text>
        </HStack>
        <HStack gap={3}>
          <Text
            fontFamily="mono"
            fontSize="sm"
            color={simColor(match.similarity)}
            fontWeight="bold"
          >
            {(match.similarity * 100).toFixed(1)}%
          </Text>
          <Text fontFamily="mono" fontSize="10px" color="#555">
            {match.startDate} ~ {match.endDate}
          </Text>
        </HStack>
      </HStack>

      {isLoading ? (
        <Flex justify="center" align="center" h="80px">
          <Spinner size="xs" color="brand.matrix" />
        </Flex>
      ) : (
        <EquityKlineMini
          bars={contextBars}
          highlightStart={match.startDate}
          highlightEnd={match.endDate}
          similarity={match.similarity}
        />
      )}
    </Box>
  );
}
