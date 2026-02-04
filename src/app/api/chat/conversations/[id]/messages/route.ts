import { createApiHandler } from '@/server/services/api-helpers';
import { chatService } from '@/server/services/chat-service';

export const GET = createApiHandler(
  async (_request, params = Promise.resolve({ id: '' }), supabase, user) => {
    const { id } = await params;
    const data = await chatService.getMessages(supabase, user.id, id);
    return { data };
  },
);
