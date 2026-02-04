import type { neologUserProfiles } from '@/server/db/schema';
import type { Database } from '@/server/types/database';
import type {
  UserProfileModel,
  UserPortrait,
  EmotionEntry,
  BehaviorSummary,
} from '@/server/types/profile-server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { InferSelectModel } from 'drizzle-orm';

const MAX_RECENT_EMOTIONS = 20;
const MAX_RECENT_BEHAVIORS = 20;

/**
 * Convert raw DB row to typed UserProfileModel
 */
function convertProfile(row: InferSelectModel<typeof neologUserProfiles>): UserProfileModel {
  // JSONB fields from DB need type assertions
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const portrait = (row.portrait ?? {}) as UserPortrait;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const recentEmotions = (row.recent_emotions ?? []) as EmotionEntry[];
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const recentBehaviors = (row.recent_behaviors ?? []) as BehaviorSummary[];

  return {
    id: row.id,
    user_id: row.user_id,
    portrait,
    recent_emotions: recentEmotions,
    recent_behaviors: recentBehaviors,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Profile service - Logic for user profile and emotion/behavior tracking
 */
export const profileService = {
  /**
   * Get user profile, returns null if not exists
   */
  async getProfile(
    supabase: SupabaseClient<Database>,
    userId: string,
  ): Promise<UserProfileModel | null> {
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('neolog_user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return convertProfile(data);
  },

  /**
   * Create initial profile for a new user
   */
  async createProfile(
    supabase: SupabaseClient<Database>,
    userId: string,
  ): Promise<UserProfileModel> {
    if (!userId) throw new Error('User ID is required');

    const { data, error } = await supabase
      .from('neolog_user_profiles')
      .insert({
        user_id: userId,
        portrait: {},
        recent_emotions: [],
        recent_behaviors: [],
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return convertProfile(data);
  },

  /**
   * Get or create user profile
   */
  async getOrCreateProfile(
    supabase: SupabaseClient<Database>,
    userId: string,
  ): Promise<UserProfileModel> {
    const existing = await profileService.getProfile(supabase, userId);
    if (existing) return existing;
    return profileService.createProfile(supabase, userId);
  },

  /**
   * Update user portrait (merges with existing)
   */
  async updatePortrait(
    supabase: SupabaseClient<Database>,
    userId: string,
    portrait: UserPortrait,
  ): Promise<UserProfileModel> {
    if (!userId) throw new Error('User ID is required');

    const existing = await profileService.getOrCreateProfile(supabase, userId);
    const mergedPortrait: UserPortrait = {
      ...existing.portrait,
      ...portrait,
    };

    const { data, error } = await supabase
      .from('neolog_user_profiles')
      .update({
        portrait: mergedPortrait,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return convertProfile(data);
  },

  /**
   * Add emotion entries (keeps most recent N entries)
   */
  async addEmotions(
    supabase: SupabaseClient<Database>,
    userId: string,
    emotions: EmotionEntry[],
  ): Promise<UserProfileModel> {
    if (!userId) throw new Error('User ID is required');

    const existing = await profileService.getOrCreateProfile(supabase, userId);
    const updated = [...existing.recent_emotions, ...emotions].slice(-MAX_RECENT_EMOTIONS);

    const { data, error } = await supabase
      .from('neolog_user_profiles')
      .update({
        recent_emotions: updated,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return convertProfile(data);
  },

  /**
   * Add behavior summaries (keeps most recent N entries)
   */
  async addBehaviors(
    supabase: SupabaseClient<Database>,
    userId: string,
    behaviors: BehaviorSummary[],
  ): Promise<UserProfileModel> {
    if (!userId) throw new Error('User ID is required');

    const existing = await profileService.getOrCreateProfile(supabase, userId);
    const updated = [...existing.recent_behaviors, ...behaviors].slice(-MAX_RECENT_BEHAVIORS);

    const { data, error } = await supabase
      .from('neolog_user_profiles')
      .update({
        recent_behaviors: updated,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return convertProfile(data);
  },
};
