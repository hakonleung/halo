import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { SettingsUpdateRequest } from '@/types/settings-server';

/**
 * Settings service - Server-side logic for user settings
 */
export const settingsService = {
  /**
   * Get user settings
   */
  async getSettings(supabase: SupabaseClient<Database>, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const { data, error } = await supabase
      .from('neolog_user_settings')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  /**
   * Update user settings (partial update)
   * Uses upsert to handle cases where settings record doesn't exist
   */
  async updateSettings(
    supabase: SupabaseClient<Database>,
    userId: string,
    updates: SettingsUpdateRequest,
  ) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get existing settings to merge with updates (ignore error if not found)
    const { data: existing } = await supabase
      .from('neolog_user_settings')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // Use upsert to update or insert
    const { data, error } = await supabase
      .from('neolog_user_settings')
      .upsert(
        {
          id: userId,
          ...(existing ? existing : {}),
          ...updates,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        },
      )
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  },
};
