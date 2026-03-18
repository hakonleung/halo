import { chatService } from '@/server/services/chat-service';

import { createApiHandler } from '@neo-log/be-edge';

/**
 * GET /api/chat/conversation
 * Get or create the user's single conversation
 */
export const GET = createApiHandler(async (_request, _params, supabase, user) => {
  const data = await chatService.getOrCreateConversation(supabase, user.id);
  return { data };
});
