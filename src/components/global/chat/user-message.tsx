'use client';

import { VStack, Text, Box } from '@chakra-ui/react';

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <VStack align="end" gap={1} maxW="1200px" mx="auto" w="full">
      <Text fontSize="xs" color="text.mist" fontWeight="bold" fontFamily="mono">
        ME
      </Text>
      <Box
        bg="brand.cyber"
        p={4}
        borderRadius="4px"
        borderRight="3px solid"
        borderColor="brand.cyber"
        color="bg.deep"
        w="full"
        maxW="85%"
        ml="auto"
      >
        <Text whiteSpace="pre-wrap">{content}</Text>
      </Box>
    </VStack>
  );
}
