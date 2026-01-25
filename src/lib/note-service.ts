import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import type { Note, NoteCreateRequest } from '@/types/note-server';

/**
 * Note service - Logic for user notes
 */
export const noteService = {
  /**
   * Get all notes for a user
   */
  async getNotes(supabase: SupabaseClient<Database>, userId: string) {
    if (!userId) return { data: null, error: 'User ID is required' };
    const { data, error } = await supabase
      .from('neolog_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as Note[], error: null };
  },

  /**
   * Create a new note
   */
  async createNote(
    supabase: SupabaseClient<Database>,
    userId: string,
    note: NoteCreateRequest
  ) {
    if (!userId) return { data: null, error: 'User ID is required' };
    const { data, error } = await supabase
      .from('neolog_notes')
      .insert({
        ...note,
        user_id: userId,
        updated_at: new Date().toISOString(),
      } as Database['public']['Tables']['neolog_notes']['Insert'])
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Note, error: null };
  },

  /**
   * Update an existing note
   */
  async updateNote(
    supabase: SupabaseClient<Database>,
    userId: string,
    noteId: string,
    updates: Partial<NoteCreateRequest>
  ) {
    if (!userId || !noteId) return { data: null, error: 'User ID and Note ID are required' };
    const { data, error } = await supabase
      .from('neolog_notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as Database['public']['Tables']['neolog_notes']['Update'])
      .eq('id', noteId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Note, error: null };
  },

  /**
   * Delete a note
   */
  async deleteNote(supabase: SupabaseClient<Database>, userId: string, noteId: string) {
    if (!userId || !noteId) return { error: 'User ID and Note ID are required' };
    const { error } = await supabase
      .from('neolog_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);

    if (error) return { error: error.message };
    return { error: null };
  },
};

