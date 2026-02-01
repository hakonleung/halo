import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Conversation, ChatMessage, ChatRole, ChatAttachment } from '@/types/chat-server';
import type { InferSelectModel } from 'drizzle-orm';
import type { neologConversations, neologMessages } from '@/db/schema';

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
    if (!userId) return { data: null, error: 'User ID is required' };
    const { data, error } = await supabase
      .from('neolog_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data.map(serverConvertConversation), error: null };
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(supabase: SupabaseClient<Database>, userId: string, conversationId: string) {
    if (!userId || !conversationId)
      return { data: null, error: 'User ID and Conversation ID are required' };
    // Verify ownership first
    const { data: conv, error: convError } = await supabase
      .from('neolog_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (convError || !conv) {
      return { data: null, error: 'Conversation not found or access denied' };
    }

    const { data, error } = await supabase
      .from('neolog_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: data.map(serverConvertChatMessage), error: null };
  },

  /**
   * Create a new conversation
   */
  async createConversation(supabase: SupabaseClient<Database>, userId: string, title?: string) {
    if (!userId) return { data: null, error: 'User ID is required' };
    const { data, error } = await supabase
      .from('neolog_conversations')
      .insert({
        user_id: userId,
        title: title || 'New Conversation',
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: serverConvertConversation(data), error: null };
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
    if (!userId) return { data: null, error: 'User ID is required' };
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

    if (error) return { data: null, error: error.message };

    // Update conversation timestamp
    await supabase
      .from('neolog_conversations')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.conversationId);

    return { data: serverConvertChatMessage(data), error: null };
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(
    supabase: SupabaseClient<Database>,
    userId: string,
    conversationId: string,
  ) {
    if (!userId || !conversationId) return { error: 'User ID and Conversation ID are required' };
    const { error } = await supabase
      .from('neolog_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (error) return { error: error.message };
    return { error: null };
  },
};
