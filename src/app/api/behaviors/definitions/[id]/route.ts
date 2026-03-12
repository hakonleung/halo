import { createApiHandler } from '@neo-log/be-edge';
import { behaviorService } from '@/server/services/behavior-service';

export const PATCH = createApiHandler(
  async (request, params = Promise.resolve({ id: '' }), supabase, user) => {
    const { id } = await params;
    const updates = await request.json();
    const data = await behaviorService.updateDefinition(supabase, user.id, id, updates);
    return { data };
  },
);
