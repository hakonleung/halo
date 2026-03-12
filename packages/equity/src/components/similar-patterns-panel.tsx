'use client';

import { Box, Flex, HStack, Spinner, Text } from '@chakra-ui/react';
import { useState } from 'react';

import type { PatternMatch } from '../types';
import { EquityMatchCard } from './equity-match-card';

interface Props {
  matches: PatternMatch[];
  isLoading: boolean;
  statusMsg: string;
}

const INITIAL_LIMIT = 10;

export function SimilarPatternsPanel({ matches, isLoading, statusMsg }: Props) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? matches : matches.slice(0, INITIAL_LIMIT);

  if (isLoading && matches.length === 0) {
    return (
      <Flex justify="center" align="center" h="80px" gap={2}>
        <Spinner color="brand.matrix" size="sm" />
        <Text fontFamily="mono" fontSize="xs" color="#888">
          {statusMsg || '正在计算相似走势...'}
        </Text>
      </Flex>
    );
  }

  if (!isLoading && matches.length === 0) {
    return (
      <Flex justify="center" align="center" h="60px">
        <Text fontFamily="mono" fontSize="xs" color="#555">
          未找到相似走势
        </Text>
      </Flex>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={3}>
        <HStack gap={2}>
          <Text fontFamily="mono" fontSize="xs" color="#555" letterSpacing="0.1em">
            相似走势
          </Text>
          <Text fontFamily="mono" fontSize="xs" color="brand.matrix">
            {matches.length}
          </Text>
          {isLoading && <Spinner size="xs" color="brand.matrix" />}
          {isLoading && statusMsg && (
            <Text fontFamily="mono" fontSize="10px" color="#555">
              {statusMsg}
            </Text>
          )}
        </HStack>
      </HStack>

      <Box>
        {displayed.map((m, i) => (
          <EquityMatchCard key={`${m.code}-${m.startDate}`} match={m} rank={i + 1} />
        ))}
      </Box>

      {!showAll && matches.length > INITIAL_LIMIT && (
        <Box
          as="button"
          w="full"
          mt={2}
          py={2}
          textAlign="center"
          fontFamily="mono"
          fontSize="xs"
          color="#555"
          border="1px solid rgba(255,255,255,0.06)"
          borderRadius="4px"
          cursor="pointer"
          _hover={{ color: 'brand.matrix', borderColor: 'rgba(0,255,65,0.2)' }}
          onClick={() => setShowAll(true)}
        >
          查看全部 {matches.length} 个结果
        </Box>
      )}
    </Box>
  );
}
