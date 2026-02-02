import { createApiHandler } from '@/lib/api-helpers';
import { behaviorService } from '@/lib/behavior-service';

export const PATCH = createApiHandler(
  async (request, params = Promise.resolve({ id: '' }), supabase, user) => {
    const { id } = await params;
    const updates = await request.json();
    const data = await behaviorService.updateRecord(supabase, user.id, id, updates);
    return { data };
  },
);

export const DELETE = createApiHandler(
  async (_request, params = Promise.resolve({ id: '' }), supabase, user) => {
    const { id } = await params;
    await behaviorService.deleteRecord(supabase, user.id, id);
    return { data: null };
  },
);
