import type { InferSelectModel } from 'drizzle-orm';
import type { neologConversations, neologMessages } from '@/server/db/schema';

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

enum ChatAttachmentType {
  Image = 'image',
  Audio = 'audio',
}

export interface ChatAttachment {
  type: ChatAttachmentType;
  url: string;
  mimeType: string;
}

// Request types
export interface UpdateConversationRequest {
  title: string;
}

export interface GenerateTitleParams {
  messageContent: string;
  maxLength?: number;
  language?: 'en' | 'zh-CN';
}
