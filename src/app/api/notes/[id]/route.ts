import { createApiHandler } from '@/server/services/api-helpers';
import { noteService } from '@/server/services/note-service';

export const PATCH = createApiHandler(
  async (request, params = Promise.resolve({ id: '' }), supabase, user) => {
    const { id } = await params;
    const updates = await request.json();
    const data = await noteService.updateNote(supabase, user.id, id, updates);
    return { data };
  },
);

export const DELETE = createApiHandler(
  async (_request, params = Promise.resolve({ id: '' }), supabase, user) => {
    const { id } = await params;
    await noteService.deleteNote(supabase, user.id, id);
    return { data: null };
  },
);
