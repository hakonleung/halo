'use client';

import { Box, Input, Text, VStack, Spinner } from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';

import { useSearchEquity } from '@/client/hooks/use-equity';

import type { EquitySearchResult } from '@/client/types/equity-client';

interface Props {
  onSelect: (stock: EquitySearchResult) => void;
}

export function StockSearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, isLoading } = useSearchEquity(query);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (stock: EquitySearchResult) => {
    setQuery('');
    setOpen(false);
    onSelect(stock);
  };

  return (
    <Box ref={containerRef} position="relative" w="100%" maxW="360px">
      <Box position="relative">
        <Input
          placeholder="搜索股票代码或名称..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          fontFamily="mono"
          fontSize="sm"
          bg="#0A0A0A"
          border="1px solid"
          borderColor="whiteAlpha.200"
          _focus={{
            borderColor: 'brand.matrix',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-matrix)',
          }}
          _placeholder={{ color: 'text.dim' }}
          color="text.neon"
          pr={isLoading ? '40px' : undefined}
        />
        {isLoading && (
          <Box position="absolute" right={3} top="50%" transform="translateY(-50%)">
            <Spinner size="xs" color="brand.matrix" />
          </Box>
        )}
      </Box>

      {open && results.length > 0 && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          bg="#1A1A1A"
          border="1px solid rgba(0,255,65,0.3)"
          borderRadius="4px"
          zIndex={100}
          maxH="240px"
          overflowY="auto"
          boxShadow="0 0 20px rgba(0,255,65,0.1)"
        >
          <VStack gap={0} align="stretch">
            {results.map((s) => (
              <Box
                key={s.secid}
                px={3}
                py={2}
                cursor="pointer"
                _hover={{ bg: 'rgba(0,255,65,0.08)' }}
                borderBottom="1px solid"
                borderColor="whiteAlpha.100"
                onClick={() => handleSelect(s)}
              >
                <Text fontFamily="mono" fontSize="sm" color="brand.matrix">
                  {s.code}
                </Text>
                <Text fontSize="xs" color="text.mist">
                  {s.name} · {s.market}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
