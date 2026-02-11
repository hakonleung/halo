'use client';

import { Box, Card, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';

const cardVariants = [
  { variant: 'default', label: 'Default', desc: 'Glassmorphism + matrix border' },
  { variant: 'decorated', label: 'Decorated', desc: 'Corner accents' },
  { variant: 'scanline', label: 'Scanline', desc: 'Animated scan effect' },
  { variant: 'solid', label: 'Solid', desc: 'Carbon background, no blur' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
const V = (v: string) => v as any;

interface PlaygroundCardsProps {
  size: 'sm' | 'md' | 'lg';
}

export function PlaygroundCards({ size }: PlaygroundCardsProps) {
  return (
    <Box>
      <Heading
        fontFamily="heading"
        fontSize="20px"
        color="brand.matrix"
        textShadow="0 0 8px currentColor"
        borderBottom="1px solid"
        borderColor="rgba(0, 255, 65, 0.3)"
        pb={2}
        mb={4}
      >
        {`// Cards`}
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {cardVariants.map(({ variant, label, desc }) => (
          <Card.Root key={variant} variant={V(variant)} size={size}>
            <Card.Body>
              <VStack gap={2} align="start">
                <Text fontFamily="heading" fontSize="14px" color="brand.matrix">
                  {label}
                </Text>
                <Text fontFamily="mono" fontSize="12px" color="text.mist">
                  variant=&quot;{variant}&quot;
                </Text>
                <Text fontFamily="body" fontSize="14px" color="text.neon">
                  {desc}
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>
    </Box>
  );
}
