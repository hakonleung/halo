/**
 * Chat API
 */

import { BaseApiService, type ApiResponse } from './base';
import {
  type Conversation as ServerConversation,
  type ChatMessage as ServerChatMessage,
  ChatRole,
} from '@/server/types/chat-server';
import type {
  Conversation as ClientConversation,
  ChatMessage as ClientChatMessage,
} from '@/client/types/chat-client';

function convertConversation(server: ServerConversation): ClientConversation {
  return {
    id: server.id,
    userId: server.user_id,
    title: server.title ?? undefined,
    createdAt: server.created_at ?? new Date().toISOString(),
    updatedAt: server.updated_at ?? new Date().toISOString(),
  };
}

function convertChatMessage(server: ServerChatMessage): ClientChatMessage {
  return {
    id: server.id,
    conversationId: server.conversation_id,
    userId: server.user_id,
    role: Object.values(ChatRole).find((r) => r === server.role) || ChatRole.User,
    content: server.content,
    attachments: server.attachments,
    metadata: server.metadata,
    createdAt: server.created_at ?? new Date().toISOString(),
  };
}

export const chatApi = {
  /**
   * Get conversations
   */
  async getConversations(): Promise<ClientConversation[]> {
    const response =
      await BaseApiService.fetchApi<ApiResponse<ServerConversation[]>>('/api/chat/conversations');

    if ('error' in response) {
      throw new Error(response.error);
    }

    return response.data.map(convertConversation);
  },

  /**
   * Get messages in a conversation
   */
  async getMessages(conversationId: string): Promise<ClientChatMessage[]> {
    const response = await BaseApiService.fetchApi<ApiResponse<ServerChatMessage[]>>(
      `/api/chat/conversations/${conversationId}/messages`,
    );

    if ('error' in response) {
      throw new Error(response.error);
    }

    return response.data.map(convertChatMessage);
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const response = await BaseApiService.fetchApi<ApiResponse<null>>(
      `/api/chat/conversations/${conversationId}`,
      {
        method: 'DELETE',
      },
    );

    if ('error' in response) {
      throw new Error(response.error);
    }
  },

  /**
   * Update a conversation
   */
  async updateConversation(
    conversationId: string,
    updates: { title: string },
  ): Promise<ClientConversation> {
    const response = await BaseApiService.fetchApi<ApiResponse<ServerConversation>>(
      `/api/chat/conversations/${conversationId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      },
    );

    if ('error' in response) {
      throw new Error(response.error);
    }

    return convertConversation(response.data);
  },
};
