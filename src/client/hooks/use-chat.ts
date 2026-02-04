import { useChat as useAIChat, type UIMessage } from '@ai-sdk/react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { DefaultChatTransport } from 'ai';
import { useMemo, useEffect } from 'react';

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

  // Generate a new conversation ID if not provided (for new conversations)
  const effectiveConversationId = useMemo(() => {
    if (conversationId) return conversationId;
    // Generate UUID for new conversation (will be sent to backend)
    return crypto.randomUUID();
  }, [conversationId]);

  // Load DB messages via TanStack Query
  const { data: dbMessages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', effectiveConversationId],
    queryFn: () => {
      if (!conversationId) return []; // New conversation, no messages yet
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
        body: { conversationId: effectiveConversationId },
      }),
    [effectiveConversationId],
  );

  // AI SDK useChat
  const { messages, sendMessage, status, error, setMessages } = useAIChat({
    id: effectiveConversationId,
    messages: initialMessages,
    transport,
    onFinish: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      void queryClient.invalidateQueries({ queryKey: ['messages', effectiveConversationId] });
    },
  });

  // Sync initialMessages to AI SDK messages when conversation changes
  // Only sync when we actually have messages to load (switching to an existing conversation)
  useEffect(() => {
    // Only sync if we're loading an existing conversation with messages
    if (conversationId && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [conversationId, initialMessages.length, setMessages]);

  return {
    messages,
    loadingMessages,
    sendMessage,
    status,
    error,
    setMessages,
    conversationId: effectiveConversationId, // Return the effective ID for syncing with URL
  };
}

/**
 * Hook for deleting a conversation
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => internalApiService.deleteConversation(conversationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * Hook for updating a conversation
 */
export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, title }: { conversationId: string; title: string }) =>
      internalApiService.updateConversation(conversationId, { title }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
