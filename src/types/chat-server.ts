import type { InferSelectModel } from 'drizzle-orm';
import type { neologConversations, neologMessages } from '@/db/schema';

// Server-side types for chat (Inferred from Drizzle Entity)
export type Conversation = InferSelectModel<typeof neologConversations>;
export type ChatMessage = InferSelectModel<typeof neologMessages> & {
  attachments: ChatAttachment[];
  metadata: Record<string, unknown>;
};

export enum ChatRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

export enum ChatAttachmentType {
  Image = 'image',
  Audio = 'audio',
}

export interface ChatAttachment {
  type: ChatAttachmentType;
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
