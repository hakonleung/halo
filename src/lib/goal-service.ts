import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import type { Goal, GoalCreateRequest } from '@/types/goal-server';

/**
 * Goal service - Logic for user goals
 */
export const goalService = {
  /**
   * Get all goals for a user
   */
  async getGoals(supabase: SupabaseClient<Database>, userId: string) {
    if (!userId) return { data: null, error: 'User ID is required' };
    const { data, error } = await supabase
      .from('neolog_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as Goal[], error: null };
  },

  /**
   * Create a new goal
   */
  async createGoal(
    supabase: SupabaseClient<Database>,
    userId: string,
    goal: GoalCreateRequest
  ) {
    if (!userId) return { data: null, error: 'User ID is required' };
    const { data, error } = await supabase
      .from('neolog_goals')
      .insert({
        ...goal,
        user_id: userId,
        updated_at: new Date().toISOString(),
      } as Database['public']['Tables']['neolog_goals']['Insert'])
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Goal, error: null };
  },

  /**
   * Update an existing goal
   */
  async updateGoal(
    supabase: SupabaseClient<Database>,
    userId: string,
    goalId: string,
    updates: Partial<GoalCreateRequest>
  ) {
    if (!userId || !goalId) return { data: null, error: 'User ID and Goal ID are required' };
    const { data, error } = await supabase
      .from('neolog_goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as Database['public']['Tables']['neolog_goals']['Update'])
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Goal, error: null };
  },

  /**
   * Delete a goal
   */
  async deleteGoal(supabase: SupabaseClient<Database>, userId: string, goalId: string) {
    if (!userId || !goalId) return { error: 'User ID and Goal ID are required' };
    const { error } = await supabase
      .from('neolog_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (error) return { error: error.message };
    return { error: null };
  },
};

