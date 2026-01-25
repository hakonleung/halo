import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import type {
  UserSettings,
  SettingsUpdateRequest,
  SettingsResponse,
} from '@/types/settings-server';

/**
 * Settings service - Server-side logic for user settings
 */
export const settingsService = {
  /**
   * Get user settings
   */
  async getSettings(supabase: SupabaseClient<Database>, userId: string): Promise<SettingsResponse> {
    if (!userId) {
      return { settings: null, error: 'User ID is required' };
    }
    const { data, error } = await supabase
      .from('neolog_user_settings')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { settings: null, error: error.message };
    }

    return { settings: data as UserSettings, error: null };
  },

  /**
   * Update user settings (partial update)
   */
  async updateSettings(
    supabase: SupabaseClient<Database>,
    userId: string,
    updates: SettingsUpdateRequest
  ): Promise<SettingsResponse> {
    if (!userId) {
      return { settings: null, error: 'User ID is required' };
    }
    const { data, error } = await supabase
      .from('neolog_user_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as Database['public']['Tables']['neolog_user_settings']['Update'])
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { settings: null, error: error.message };
    }

    return { settings: data as unknown as UserSettings, error: null };
  },
};
