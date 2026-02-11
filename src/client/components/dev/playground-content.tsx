'use client';

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';

import { PlaygroundCards } from './playground-cards';
import { PlaygroundColors } from './playground-colors';
import { PlaygroundInputs } from './playground-inputs';
import { PlaygroundOverlays } from './playground-overlays';
import { SectionTitle } from './playground-shared';

type ComponentSize = 'sm' | 'md' | 'lg';

const SIZES: ComponentSize[] = ['sm', 'md', 'lg'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
const V = (v: string) => v as any;

function SizeSelector({
  value,
  onChange,
}: {
  value: ComponentSize;
  onChange: (s: ComponentSize) => void;
}) {
  return (
    <HStack gap={1}>
      <Text fontFamily="mono" fontSize="12px" color="text.mist" mr={2}>
        size:
      </Text>
      {SIZES.map((s) => (
        <Button
          key={s}
          size="sm"
          variant={V(s === value ? 'toggle-active' : 'toggle')}
          onClick={() => onChange(s)}
          fontFamily="mono"
          minW="48px"
        >
          {s}
        </Button>
      ))}
    </HStack>
  );
}

export function PlaygroundContent() {
  const [size, setSize] = useState<ComponentSize>('md');

  return (
    <Box p={{ base: 3, md: 6 }} maxW="1200px" mx="auto" zIndex={10} pos="relative">
      <VStack gap={5} align="stretch">
        <Flex justify="space-between" align="end" wrap="wrap" gap={4}>
          <Box>
            <Heading fontFamily="heading" fontSize="28px" color="brand.matrix" mb={1}>
              NEO-LOG PLAYGROUND
            </Heading>
            <Text fontFamily="mono" fontSize="14px" color="text.mist">
              Component & Token Reference — dev only
            </Text>
          </Box>
          <SizeSelector value={size} onChange={setSize} />
        </Flex>

        <PlaygroundColors />

        {/* Buttons */}
        <Box>
          <SectionTitle>Buttons</SectionTitle>
          <VStack gap={4} align="stretch">
            <Flex gap={3} wrap="wrap">
              <Button variant={V('primary')} size={size}>
                Primary
              </Button>
              <Button variant={V('secondary')} size={size}>
                Secondary
              </Button>
              <Button variant={V('danger')} size={size}>
                Danger
              </Button>
              <Button variant="ghost" size={size}>
                Ghost
              </Button>
              <Button variant={V('toggle')} size={size}>
                Toggle
              </Button>
              <Button variant={V('toggle-active')} size={size}>
                Toggle Active
              </Button>
            </Flex>
            <Flex gap={3} wrap="wrap">
              <Button variant={V('primary')} size={size} disabled>
                Disabled
              </Button>
              <Button variant={V('secondary')} size={size} disabled>
                Disabled
              </Button>
            </Flex>
          </VStack>
        </Box>

        {/* Badges */}
        <Box>
          <SectionTitle>Badges</SectionTitle>
          <Flex gap={3} wrap="wrap">
            <Badge size={size} colorPalette="success">
              SUCCESS
            </Badge>
            <Badge size={size} colorPalette="warning">
              WARNING
            </Badge>
            <Badge size={size} colorPalette="error">
              ERROR
            </Badge>
            <Badge size={size} colorPalette="info">
              INFO
            </Badge>
            <Badge size={size} colorPalette="neutral">
              NEUTRAL
            </Badge>
          </Flex>
        </Box>

        <PlaygroundInputs size={size} />
        <PlaygroundCards size={size} />
        <PlaygroundOverlays size={size} />

        {/* Skeleton */}
        <Box>
          <SectionTitle>Skeleton</SectionTitle>
          <VStack gap={4} align="stretch">
            <Skeleton height="40px" />
            <Flex gap={3}>
              <Skeleton height="80px" flex="1" />
              <Skeleton height="80px" flex="1" />
              <Skeleton height="80px" flex="1" />
            </Flex>
            <Skeleton variant={V('matrix')} height="40px" />
          </VStack>
        </Box>

        {/* Typography */}
        <Box>
          <SectionTitle>Typography</SectionTitle>
          <VStack gap={3} align="stretch">
            <Text fontFamily="heading" fontSize="24px" color="text.neon">
              Heading — Orbitron
            </Text>
            <Text fontFamily="body" fontSize="16px" color="text.neon">
              Body — Rajdhani: The quick brown fox jumps over the lazy dog
            </Text>
            <Text fontFamily="mono" fontSize="14px" color="text.neon">
              Mono — JetBrains Mono: const neo = &quot;LOG&quot;;
            </Text>
            <Text color="text.neon">Primary text (#E0E0E0)</Text>
            <Text color="text.mist">Secondary text (#888888)</Text>
            <Text color="text.dim">Disabled text (#555555)</Text>
          </VStack>
        </Box>

        {/* Glow Shadows */}
        <Box>
          <SectionTitle>Glow Shadows</SectionTitle>
          <Flex gap={4} wrap="wrap">
            {(['sm', 'md', 'lg'] as const).map((s) => (
              <Box
                key={s}
                p={4}
                bg="bg.carbon"
                borderRadius="4px"
                border="1px solid"
                borderColor="rgba(0, 255, 65, 0.2)"
                boxShadow={s}
                minW="120px"
                textAlign="center"
              >
                <Text fontFamily="mono" fontSize="12px" color="text.mist">
                  glow.{s}
                </Text>
              </Box>
            ))}
            <Box
              p={4}
              bg="bg.carbon"
              borderRadius="4px"
              border="1px solid"
              borderColor="rgba(255, 51, 102, 0.2)"
              boxShadow="error"
              minW="120px"
              textAlign="center"
            >
              <Text fontFamily="mono" fontSize="12px" color="semantic.error">
                glow.error
              </Text>
            </Box>
          </Flex>
        </Box>
      </VStack>
    </Box>
  );
}
