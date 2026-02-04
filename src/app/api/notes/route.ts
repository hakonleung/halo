import { createApiHandler } from '@/server/services/api-helpers';
import { noteService } from '@/server/services/note-service';

export const GET = createApiHandler(async (_request, _params, supabase, user) => {
  const data = await noteService.getNotes(supabase, user.id);
  return { data };
});

export const POST = createApiHandler(async (request, _params, supabase, user) => {
  const note = await request.json();
  const data = await noteService.createNote(supabase, user.id, note);
  return { data, status: 201 };
});
