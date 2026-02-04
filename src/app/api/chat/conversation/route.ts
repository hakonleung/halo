import { createApiHandler } from '@/server/services/api-helpers';
import { chatService } from '@/server/services/chat-service';

/**
 * GET /api/chat/conversation
 * Get or create the user's single conversation
 */
export const GET = createApiHandler(async (_request, _params, supabase, user) => {
  const data = await chatService.getOrCreateConversation(supabase, user.id);
  return { data };
});
