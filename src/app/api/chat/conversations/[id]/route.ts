import { createApiHandler } from '@/lib/api-helpers';
import { chatService } from '@/lib/chat-service';
import type { UpdateConversationRequest } from '@/types/chat-server';

/**
 * PATCH /api/chat/conversations/[id]
 * Update a conversation (e.g. title)
 */
export const PATCH = createApiHandler(
  async (request, params = Promise.resolve({ id: '' }), supabase, user) => {
    const { id } = await params;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const body = (await request.json()) as UpdateConversationRequest;
    const { title } = body;

    // Validate title
    if (!title || title.length === 0 || title.length > 100) {
      throw new Error('Title must be 1-100 characters');
    }

    // Update conversation
    const updatedConv = await chatService.updateConversation(supabase, user.id, id, { title });

    return { data: updatedConv };
  },
);

/**
 * DELETE /api/chat/conversations/[id]
 * Delete a conversation and all its messages
 */
export const DELETE = createApiHandler(
  async (_request, params = Promise.resolve({ id: '' }), supabase, user) => {
    const { id } = await params;
    await chatService.deleteConversation(supabase, user.id, id);
    return { data: null };
  },
);
