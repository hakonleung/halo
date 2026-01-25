import { InferSelectModel } from 'drizzle-orm';
import { neologConversations, neologMessages } from '@/db/schema';

// Server-side types for chat (Inferred from Drizzle Entity)
export type Conversation = InferSelectModel<typeof neologConversations>;
export type ChatMessage = InferSelectModel<typeof neologMessages> & {
  attachments: ChatAttachment[];
  metadata: Record<string, unknown>;
};

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatAttachment {
  type: 'image' | 'audio';
  url: string;
  mimeType: string;
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

