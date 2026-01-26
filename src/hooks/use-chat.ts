import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Conversation, ChatMessage } from '@/types/chat-client';

/**
 * Hook for managing chat conversations
 */
export function useConversations() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch('/api/chat/conversations');
      return res.json() as Promise<{ data: Conversation[]; error: string | null }>;
    },
  });

  return {
    conversations: data?.data ?? [],
    isLoading,
    error: error?.message ?? data?.error ?? null,
  };
}

/**
 * Hook for managing messages in a conversation
 */
export function useChat(conversationId?: string) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return { data: [], error: null };
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`);
      return res.json() as Promise<{ data: ChatMessage[]; error: string | null }>;
    },
    enabled: !!conversationId,
  });

  const sendMessage = useCallback(
    async (content: string) => {
      setIsStreaming(true);
      setStreamingContent('');

      try {
        const response = await fetch('/api/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, conversationId }),
        });

        if (!response.ok) throw new Error('Failed to send message');

        const reader = response.body?.getReader();

        if (!reader) return;

        let currentConversationId = conversationId;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('event: token')) {
              const data = JSON.parse(line.replace('event: token\ndata: ', ''));
              setStreamingContent((prev) => prev + data.content);
            } else if (line.startsWith('event: done')) {
              const data = JSON.parse(line.replace('event: done\ndata: ', ''));
              currentConversationId = data.conversationId;
              // Invalidate queries to refresh history
              void queryClient.invalidateQueries({ queryKey: ['messages', currentConversationId] });
              void queryClient.invalidateQueries({ queryKey: ['conversations'] });
            } else if (line.startsWith('event: error')) {
              const data = JSON.parse(line.replace('event: error\ndata: ', ''));
              throw new Error(data.error);
            }
          }
        }
      } catch (err) {
        console.error('Chat error:', err);
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
      }
    },
    [conversationId, queryClient],
  );

  return {
    messages: messagesData?.data ?? [],
    loadingMessages,
    sendMessage,
    isStreaming,
    streamingContent,
  };
}
