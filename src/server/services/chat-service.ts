import type { neologConversations, neologMessages } from '@/server/db/schema';
import type {
  Conversation,
  ChatMessage,
  ChatRole,
  ChatAttachment,
} from '@/server/types/chat-server';
import type { Database } from '@/server/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { InferSelectModel } from 'drizzle-orm';

const serverConvertConversation = (
  server: InferSelectModel<typeof neologConversations>,
): Conversation => {
  // FIXME
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return server as Conversation;
};

const serverConvertChatMessage = (server: InferSelectModel<typeof neologMessages>): ChatMessage => {
  // FIXME
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return server as ChatMessage;
};

/**
 * Chat service - Logic for conversations and messages
 */
export const chatService = {
  /**
   * Get all conversations for a user
   */
  async getConversations(supabase: SupabaseClient<Database>, userId: string) {
    if (!userId) throw new Error('User ID is required');
    const { data, error } = await supabase
      .from('neolog_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(serverConvertConversation);
  },

  /**
   * Get messages for a conversation
   * @param count - Optional. If provided, returns only the last N messages. If not provided, returns all messages.
   */
  async getMessages(
    supabase: SupabaseClient<Database>,
    userId: string,
    conversationId: string,
    count?: number,
  ) {
    if (!userId || !conversationId) throw new Error('User ID and Conversation ID are required');
    // Verify ownership first
    const { data: conv, error: convError } = await supabase
      .from('neolog_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (convError || !conv) {
      throw new Error('Conversation not found or access denied');
    }

    if (count !== undefined) {
      // Get last N messages (ordered by created_at desc, then reverse to chronological order)
      const { data, error } = await supabase
        .from('neolog_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(count);

      if (error) throw new Error(error.message);
      // Reverse to get chronological order (oldest first)
      return data.reverse().map(serverConvertChatMessage);
    }

    // Get all messages in chronological order
    const { data, error } = await supabase
      .from('neolog_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data.map(serverConvertChatMessage);
  },

  /**
   * Get or create the user's single conversation
   * Each user has only one conversation
   */
  async getOrCreateConversation(supabase: SupabaseClient<Database>, userId: string) {
    if (!userId) throw new Error('User ID is required');

    // Try to get existing conversation
    const { data: existing, error: selectError } = await supabase
      .from('neolog_conversations')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (existing && !selectError) {
      return serverConvertConversation(existing);
    }

    // Create new conversation if none exists
    const { data: newConv, error: insertError } = await supabase
      .from('neolog_conversations')
      .insert({
        user_id: userId,
        title: null, // No title needed
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);
    return serverConvertConversation(newConv);
  },

  /**
   * Create a new conversation
   */
  async createConversation(
    supabase: SupabaseClient<Database>,
    userId: string,
    title?: string,
    id?: string,
  ) {
    if (!userId) throw new Error('User ID is required');
    const { data, error } = await supabase
      .from('neolog_conversations')
      .insert({
        id,
        user_id: userId,
        title: title || 'New Conversation',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return serverConvertConversation(data);
  },

  /**
   * Save a message to a conversation
   */
  async saveMessage(
    supabase: SupabaseClient<Database>,
    userId: string,
    params: {
      conversationId: string;
      role: ChatRole;
      content: string;
      attachments?: ChatAttachment[];
      metadata?: Record<string, unknown>;
    },
  ) {
    if (!userId) throw new Error('User ID is required');
    const { data, error } = await supabase
      .from('neolog_messages')
      .insert({
        conversation_id: params.conversationId,
        user_id: userId,
        role: params.role,
        content: params.content,
        attachments: params.attachments || [],
        metadata: params.metadata || {},
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update conversation timestamp
    await supabase
      .from('neolog_conversations')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.conversationId);

    return serverConvertChatMessage(data);
  },

  /**
   * Update a conversation (e.g. title)
   */
  async updateConversation(
    supabase: SupabaseClient<Database>,
    userId: string,
    conversationId: string,
    updates: { title?: string },
  ) {
    if (!userId || !conversationId) {
      throw new Error('User ID and Conversation ID are required');
    }

    const { data, error } = await supabase
      .from('neolog_conversations')
      .update({
        title: updates.title,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return serverConvertConversation(data);
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(
    supabase: SupabaseClient<Database>,
    userId: string,
    conversationId: string,
  ): Promise<void> {
    if (!userId || !conversationId) throw new Error('User ID and Conversation ID are required');
    const { error } = await supabase
      .from('neolog_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  },
};
