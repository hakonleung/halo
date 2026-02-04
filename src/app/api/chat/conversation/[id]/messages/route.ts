import { createApiHandler } from '@/server/services/api-helpers';
import { chatService } from '@/server/services/chat-service';

/**
 * GET /api/chat/conversation/[id]/messages
 * Get messages in a conversation (last 20 messages)
 */
export const GET = createApiHandler(
  async (_request, params = Promise.resolve({ id: '' }), supabase, user) => {
    const { id } = await params;
    const data = await chatService.getMessages(supabase, user.id, id);
    return { data };
  },
);
