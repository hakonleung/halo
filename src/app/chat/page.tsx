'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Heading,
  Flex,
  Button,
} from '@chakra-ui/react';
import { Send, Plus, MessageSquare, Image, Mic } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { withAuth } from '@/components/auth/with-auth';
import { useConversations, useChat } from '@/hooks/use-chat';
import { Avatar } from '@/components/ui/avatar';

function ChatPage() {
  const { conversations } = useConversations();
  const [selectedConvId, setSelectedConvId] = useState<string | undefined>();
  const { messages, sendMessage, isStreaming, streamingContent } = useChat(selectedConvId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const content = input;
    setInput('');
    await sendMessage(content);
  };

  return (
    <AuthenticatedLayout>
      <Flex h="calc(100vh - 64px)" bg="bg.deep">
        {/* Sidebar */}
        <Box
          w="280px"
          borderRight="1px solid"
          borderColor="rgba(0, 255, 65, 0.2)"
          display={{ base: 'none', md: 'block' }}
          p={4}
        >
          <Button
            variant="outline"
            w="full"
            mb={6}
            borderColor="brand.matrix"
            color="brand.matrix"
            onClick={() => setSelectedConvId(undefined)}
            _hover={{ bg: 'rgba(0, 255, 65, 0.1)' }}
          >
            <Plus size={18} style={{ marginRight: '8px' }} /> NEW CHAT
          </Button>

          <VStack gap={2} align="stretch" overflowY="auto" maxH="calc(100% - 100px)">
            <Text color="text.mist" fontSize="xs" fontWeight="bold" letterSpacing="widest" mb={2}>
              RECENT HISTORY
            </Text>
            {conversations.map((conv) => (
              <Box
                key={conv.id}
                p={3}
                borderRadius="4px"
                bg={selectedConvId === conv.id ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
                cursor="pointer"
                onClick={() => setSelectedConvId(conv.id)}
                _hover={{ bg: 'bg.carbon' }}
                border="1px solid"
                borderColor={selectedConvId === conv.id ? 'brand.matrix' : 'transparent'}
              >
                <HStack gap={3}>
                  <MessageSquare
                    size={16}
                    color={selectedConvId === conv.id ? '#00FF41' : '#888888'}
                  />
                  <Text color="text.neon" fontSize="sm" truncate>
                    {conv.title || 'Untitled Chat'}
                  </Text>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Main Chat Area */}
        <Flex flex={1} direction="column" h="full" position="relative">
          <Box flex={1} overflowY="auto" p={6} pb="100px">
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

              {messages.map((msg) => (
                <HStack key={msg.id} align="start" gap={4} maxW="800px" mx="auto" w="full">
                  <Avatar
                    name={msg.role === 'assistant' ? 'AI' : 'U'}
                    bg={msg.role === 'assistant' ? 'brand.matrix' : 'brand.cyber'}
                    color="bg.deep"
                  />
                  <VStack align="start" gap={1} flex={1}>
                    <Text fontSize="xs" color="text.mist" fontWeight="bold" fontFamily="mono">
                      {msg.role === 'assistant' ? 'NEO-LOG AI' : 'USER'}
                    </Text>
                    <Box
                      bg={msg.role === 'assistant' ? 'rgba(0, 255, 65, 0.05)' : 'bg.carbon'}
                      p={4}
                      borderRadius="4px"
                      borderLeft={msg.role === 'assistant' ? '3px solid' : 'none'}
                      borderColor="brand.matrix"
                      color="text.neon"
                      w="full"
                    >
                      <Text whiteSpace="pre-wrap">{msg.content}</Text>
                    </Box>
                  </VStack>
                </HStack>
              ))}

              {isStreaming && (
                <HStack align="start" gap={4} maxW="800px" mx="auto" w="full">
                  <Avatar name="AI" bg="brand.matrix" color="bg.deep" />
                  <VStack align="start" gap={1} flex={1}>
                    <Text fontSize="xs" color="text.mist" fontWeight="bold" fontFamily="mono">
                      NEO-LOG AI
                    </Text>
                    <Box
                      bg="rgba(0, 255, 65, 0.05)"
                      p={4}
                      borderRadius="4px"
                      borderLeft="3px solid"
                      borderColor="brand.matrix"
                      color="text.neon"
                      w="full"
                    >
                      <Text whiteSpace="pre-wrap">
                        {streamingContent}
                        <Box as="span" animation="pulse 1s infinite">
                          ▌
                        </Box>
                      </Text>
                    </Box>
                  </VStack>
                </HStack>
              )}
              <div ref={messagesEndRef} />
            </VStack>
          </Box>

          {/* Input Area */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            p={6}
            bgGradient="linear(to-t, bg.deep, transparent)"
          >
            <Box maxW="800px" mx="auto" w="full" position="relative">
              <HStack
                bg="bg.carbon"
                p={2}
                borderRadius="8px"
                border="1px solid"
                borderColor="brand.matrix"
                boxShadow="0 0 15px rgba(0, 255, 65, 0.1)"
                gap={2}
              >
                <IconButton
                  aria-label="Upload image"
                  variant="ghost"
                  size="sm"
                  color="text.mist"
                  _hover={{ color: 'brand.cyber' }}
                >
                  <Image size={20} />
                </IconButton>
                <IconButton
                  aria-label="Voice input"
                  variant="ghost"
                  size="sm"
                  color="text.mist"
                  _hover={{ color: 'brand.cyber' }}
                >
                  <Mic size={20} />
                </IconButton>
                <Input
                  variant="subtle"
                  placeholder="Type a message or use commands /record..."
                  color="text.neon"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isStreaming}
                  border="none"
                  _focus={{ ring: 'none' }}
                />
                <IconButton
                  aria-label="Send message"
                  bg="brand.matrix"
                  color="bg.deep"
                  size="sm"
                  onClick={handleSend}
                  loading={isStreaming}
                  _hover={{ bg: '#00cc33' }}
                >
                  <Send size={18} />
                </IconButton>
              </HStack>
            </Box>
          </Box>
        </Flex>
      </Flex>
    </AuthenticatedLayout>
  );
}

export default withAuth(ChatPage);
