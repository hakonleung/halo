'use client';

import { forwardRef } from 'react';
import { Box, VStack, HStack, Text, Heading, Skeleton } from '@chakra-ui/react';
import type { UIMessage } from '@ai-sdk/react';
import { UserMessage } from './user-message';
import { AgentMessage } from './agent-message';

interface ChatMessageAreaProps {
  messages: UIMessage[];
  loading: boolean;
  isStreaming: boolean;
  error: Error | null;
  agentName?: string;
}

export const ChatMessageArea = forwardRef<HTMLDivElement, ChatMessageAreaProps>(
  ({ messages, loading, isStreaming, error, agentName }, ref) => {
    return (
      <Box flex={1} overflowY="auto" p={6} pb="100px">
        {loading ? (
          <VStack gap={6} align="stretch" maxW="1200px" mx="auto">
            {[1, 2].map((i) => (
              <HStack key={i} align="start" gap={4} justify={i % 2 === 0 ? 'end' : 'start'}>
                {i % 2 === 0 ? null : <Skeleton height="40px" width="40px" borderRadius="full" />}
                <Skeleton height="60px" width="60%" />
                {i % 2 === 0 ? <Skeleton height="40px" width="40px" borderRadius="full" /> : null}
              </HStack>
            ))}
          </VStack>
        ) : (
          <VStack gap={6} align="stretch">
            {messages.length === 0 && !isStreaming && (
              <VStack pt={20} gap={4}>
                <Heading
                  color="brand.matrix"
                  size="xl"
                  fontFamily="heading"
                  textShadow="0 0 10px currentColor"
                >
                  NEO-LOG AI
                </Heading>
                <Text color="text.mist" fontFamily="mono">
                  [ SYSTEM IDLE. WAITING FOR INPUT... ]
                </Text>
              </VStack>
            )}

            {messages.map((msg, msgIdx) => {
              const isUser = msg.role === 'user';
              const content = msg.parts
                .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                .map((p) => p.text)
                .join('');

              return isUser ? (
                <UserMessage key={msg.id} content={content} />
              ) : (
                <AgentMessage
                  key={msg.id}
                  content={content}
                  isStreaming={isStreaming && msgIdx === messages.length - 1}
                  agentName={agentName}
                />
              );
            })}

            {error && (
              <Box
                maxW="1200px"
                mx="auto"
                w="full"
                p={4}
                borderRadius="4px"
                bg="rgba(255, 107, 53, 0.1)"
                border="1px solid"
                borderColor="brand.alert"
              >
                <Text color="brand.alert" fontFamily="mono" fontSize="sm">
                  [ ERROR ] {error.message}
                </Text>
              </Box>
            )}

            <div ref={ref} />
          </VStack>
        )}
      </Box>
    );
  },
);

ChatMessageArea.displayName = 'ChatMessageArea';
