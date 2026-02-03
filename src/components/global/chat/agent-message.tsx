'use client';

import { VStack, Text, Box } from '@chakra-ui/react';
import { ChatMarkdown } from './chat-markdown';

interface AgentMessageProps {
  content: string;
  isStreaming?: boolean;
  agentName?: string;
}

export function AgentMessage({ content, isStreaming, agentName = 'NEO' }: AgentMessageProps) {
  return (
    <VStack align="start" gap={1} maxW="1200px" mx="auto" w="full">
      <Text fontSize="xs" color="text.mist" fontWeight="bold" fontFamily="mono">
        {agentName}
      </Text>
      <Box
        bg="rgba(0, 255, 65, 0.05)"
        p={4}
        borderRadius="4px"
        borderLeft="3px solid"
        borderColor="brand.matrix"
        color="text.neon"
        w="full"
        maxW="85%"
      >
        <ChatMarkdown content={content} />
        {isStreaming && (
          <Box as="span" animation="pulse 1s infinite">
            ▌
          </Box>
        )}
      </Box>
    </VStack>
  );
}
