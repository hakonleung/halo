import { createApiHandler } from '@/server/services/api-helpers';
import { chatService } from '@/server/services/chat-service';

export const GET = createApiHandler(async (_request, _params, supabase, user) => {
  const data = await chatService.getConversations(supabase, user.id);
  return { data };
});

export const POST = createApiHandler(async (request, _params, supabase, user) => {
  const { title } = await request.json();
  const data = await chatService.createConversation(supabase, user.id, title);
  return { data, status: 201 };
});
