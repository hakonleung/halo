import { createApiHandler } from '@/server/services/api-helpers';
import { behaviorService } from '@/server/services/behavior-service';

export const GET = createApiHandler(async (_request, _params, supabase, user) => {
  const data = await behaviorService.getDefinitions(supabase, user.id);
  return { data };
});

export const POST = createApiHandler(async (request, _params, supabase, user) => {
  const definition = await request.json();
  const data = await behaviorService.createDefinition(supabase, user.id, definition);
  return { data, status: 201 };
});
