'use client';

import { Box, Flex, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';

function ColorSwatch({ label, token, hex }: { label: string; token: string; hex: string }) {
  return (
    <VStack gap={1}>
      <Box w="60px" h="60px" bg={hex} borderRadius="4px" border="1px solid rgba(255,255,255,0.1)" />
      <Text fontFamily="mono" fontSize="10px" color="text.neon" textAlign="center">
        {label}
      </Text>
      <Text fontFamily="mono" fontSize="9px" color="text.dim" textAlign="center">
        {token}
      </Text>
    </VStack>
  );
}

const colorGroups = [
  {
    title: 'Brand',
    colors: [
      { label: 'Matrix', token: 'brand.matrix', hex: '#00FF41' },
      { label: 'Alert', token: 'brand.alert', hex: '#FF6B35' },
      { label: 'Cyber', token: 'brand.cyber', hex: '#00D4FF' },
    ],
  },
  {
    title: 'Background',
    colors: [
      { label: 'Deep', token: 'bg.deep', hex: '#0A0A0A' },
      { label: 'Carbon', token: 'bg.carbon', hex: '#1A1A1A' },
      { label: 'Dark', token: 'bg.dark', hex: '#2A2A2A' },
    ],
  },
  {
    title: 'Text',
    colors: [
      { label: 'Neon', token: 'text.neon', hex: '#E0E0E0' },
      { label: 'Mist', token: 'text.mist', hex: '#888888' },
      { label: 'Dim', token: 'text.dim', hex: '#555555' },
    ],
  },
  {
    title: 'Semantic',
    colors: [
      { label: 'Success', token: 'semantic.success', hex: '#00FF41' },
      { label: 'Warning', token: 'semantic.warning', hex: '#FFD700' },
      { label: 'Error', token: 'semantic.error', hex: '#FF3366' },
      { label: 'Info', token: 'semantic.info', hex: '#00D4FF' },
    ],
  },
];

export function PlaygroundColors() {
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
        {`// Colors`}
      </Heading>
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={6}>
        {colorGroups.map((group) => (
          <VStack key={group.title} gap={3} align="start">
            <Text fontFamily="mono" fontSize="12px" color="text.mist">
              {group.title}
            </Text>
            <Flex gap={3} wrap="wrap">
              {group.colors.map((c) => (
                <ColorSwatch key={c.token} {...c} />
              ))}
            </Flex>
          </VStack>
        ))}
      </SimpleGrid>
    </Box>
  );
}
