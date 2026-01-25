'use client';

import { Box, Heading, Text, VStack, Container, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <Box bg="bg.deep" minH="100vh" color="text.neon">
      <Container maxW="container.md" pt={20}>
        <VStack gap={8} align="center">
          <Heading
            as="h1"
            size="4xl"
            textShadow="0 0 10px #00FF41, 0 0 20px #00FF41"
            color="brand.matrix"
            fontFamily="heading"
          >
            NEO-LOG
          </Heading>
          <Text fontSize="xl" fontFamily="mono" color="text.mist">
            [ SYSTEM INITIALIZED ]
          </Text>
          <Text textAlign="center" color="text.neon" fontFamily="mono">
            Log your life. Hack your future.
            <br />
            The cyber-tracking system is coming online.
          </Text>
          <Button variant="solid" size="lg" onClick={() => router.push('/dashboard')} mt={4}>
            Get Started
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
