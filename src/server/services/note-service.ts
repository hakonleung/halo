import type { Database } from '@/server/types/database';
import type { NoteCreateRequest } from '@/server/types/note-server';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Note service - Logic for user notes
 */
export const noteService = {
  /**
   * Get all notes for a user
   */
  async getNotes(supabase: SupabaseClient<Database>, userId: string) {
    if (!userId) throw new Error('User ID is required');
    const { data, error } = await supabase
      .from('neolog_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Create a new note
   */
  async createNote(supabase: SupabaseClient<Database>, userId: string, note: NoteCreateRequest) {
    if (!userId) throw new Error('User ID is required');
    const { data, error } = await supabase
      .from('neolog_notes')
      .insert({
        ...note,
        user_id: userId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Update an existing note
   */
  async updateNote(
    supabase: SupabaseClient<Database>,
    userId: string,
    noteId: string,
    updates: Partial<NoteCreateRequest>,
  ) {
    if (!userId || !noteId) throw new Error('User ID and Note ID are required');
    const { data, error } = await supabase
      .from('neolog_notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Delete a note
   */
  async deleteNote(
    supabase: SupabaseClient<Database>,
    userId: string,
    noteId: string,
  ): Promise<void> {
    if (!userId || !noteId) throw new Error('User ID and Note ID are required');
    const { error } = await supabase
      .from('neolog_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  },
};
