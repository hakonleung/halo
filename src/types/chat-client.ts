// Client-side types for chat
import type { ChatRole, ChatAttachment } from './chat-server';

export interface ChatMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: ChatRole;
  content: string;
  attachments: ChatAttachment[];
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  conversationId?: string;
  content: string;
  attachments?: ChatAttachment[];
}

export interface ChatResponse {
  messageId: string;
  conversationId: string;
  error: string | null;
}
