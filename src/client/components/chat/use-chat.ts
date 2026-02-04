import { useChat as useAIChat, type UIMessage } from '@ai-sdk/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DefaultChatTransport } from 'ai';
import { useMemo, useEffect, useRef } from 'react';

import { internalApiService } from '@/client/internal-api';
import { ChatRole } from '@/server/types/chat-server';

import type { ChatMessage } from '@/client/types/chat-client';

/**
 * Convert a DB ChatMessage to AI SDK UIMessage
 */
function dbToUIMessage(msg: ChatMessage): UIMessage {
  return {
    id: msg.id,
    role: msg.role === ChatRole.Assistant ? 'assistant' : 'user',
    parts: [{ type: 'text', text: msg.content }],
  };
}

/**
 * Hook for managing messages in the user's single conversation using Vercel AI SDK
 */
export function useChat() {
  const queryClient = useQueryClient();
  const hasSentGreeting = useRef(false);

  // Get or create the user's single conversation
  const { data: conversation, isLoading: loadingConversation } = useQuery({
    queryKey: ['conversation'],
    queryFn: () => internalApiService.getOrCreateConversation(),
  });

  const conversationId = conversation?.id;

  // Load DB messages via TanStack Query
  const { data: dbMessages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => {
      if (!conversationId) return [];
      return internalApiService.getMessages(conversationId);
    },
    enabled: !!conversationId,
  });

  // Convert DB messages to UIMessage format
  const initialMessages = useMemo(() => dbMessages?.map(dbToUIMessage) ?? [], [dbMessages]);

  // Transport with custom API endpoint (no conversationId needed, backend handles it)
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat/message',
        body: {},
      }),
    [],
  );

  // AI SDK useChat
  const { messages, sendMessage, status, error, setMessages } = useAIChat({
    id: conversationId,
    messages: initialMessages,
    transport,
    onFinish: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversation'] });
      if (conversationId) {
        void queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      }
    },
  });

  // Sync initialMessages to AI SDK messages when conversation is loaded
  useEffect(() => {
    if (conversationId && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [conversationId, initialMessages.length, setMessages]);

  // Auto-send greeting message when conversation is empty (first time opening chat)
  useEffect(() => {
    if (
      conversationId &&
      !loadingMessages &&
      !loadingConversation &&
      initialMessages.length === 0 &&
      status !== 'streaming' &&
      status !== 'submitted' &&
      messages.length === 0 &&
      !hasSentGreeting.current
    ) {
      // Send empty message to trigger greeting
      hasSentGreeting.current = true;
      void sendMessage({ text: '' });
    }
    // Reset flag when conversation changes
    if (conversationId && initialMessages.length > 0) {
      hasSentGreeting.current = false;
    }
  }, [
    conversationId,
    loadingMessages,
    loadingConversation,
    initialMessages.length,
    status,
    messages.length,
    sendMessage,
  ]);

  return {
    messages,
    loadingMessages: loadingMessages || loadingConversation,
    sendMessage,
    status,
    error,
    setMessages,
    conversationId,
  };
}
