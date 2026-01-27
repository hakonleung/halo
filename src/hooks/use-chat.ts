import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { internalApiService } from '@/lib/internal-api';

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
 * Hook for managing messages in a conversation
 */
export function useChat(conversationId?: string) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => {
      if (!conversationId) throw new Error('Conversation ID is required');
      return internalApiService.getMessages(conversationId);
    },
    enabled: !!conversationId,
  });

  const sendMessage = useCallback(
    async (content: string) => {
      setIsStreaming(true);
      setStreamingContent('');

      try {
        const stream = await internalApiService.sendMessage(content, conversationId);

        if (!stream) return;

        const reader = stream.getReader();
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
    messages: messages ?? [],
    loadingMessages,
    sendMessage,
    isStreaming,
    streamingContent,
  };
}
