import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useChat as useAIChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { internalApiService } from '@/lib/internal-api';
import type { ChatMessage } from '@/types/chat-client';
import { ChatRole } from '@/types/chat-server';

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
 * Hook for managing chat conversations
 */
export function useConversations() {
  const {
    data: conversations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => internalApiService.getConversations(),
  });

  return {
    conversations: conversations ?? [],
    isLoading,
    error: error?.message ?? null,
  };
}

/**
 * Hook for managing messages in a conversation using Vercel AI SDK
 */
export function useChat(conversationId?: string) {
  const queryClient = useQueryClient();

  // Load DB messages via TanStack Query
  const { data: dbMessages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => {
      if (!conversationId) throw new Error('Conversation ID is required');
      return internalApiService.getMessages(conversationId);
    },
    enabled: !!conversationId,
  });

  // Convert DB messages to UIMessage format
  const initialMessages = useMemo(() => dbMessages?.map(dbToUIMessage) ?? [], [dbMessages]);

  // Transport with custom API endpoint and body
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat/message',
        body: { conversationId },
      }),
    [conversationId],
  );

  // AI SDK useChat
  const { messages, sendMessage, status, error, setMessages } = useAIChat({
    id: conversationId ?? 'new',
    messages: initialMessages,
    transport,
    onFinish: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (conversationId) {
        void queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      }
    },
  });

  return {
    messages,
    loadingMessages,
    sendMessage,
    status,
    error,
    setMessages,
  };
}
