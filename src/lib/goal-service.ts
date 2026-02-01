import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Goal, GoalCreateRequest } from '@/types/goal-server';
import type { InferSelectModel } from 'drizzle-orm';
import type { neologGoals } from '@/db/schema';

export const serverConvertGoal = (server: InferSelectModel<typeof neologGoals>): Goal => {
  // FIXME
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return server as Goal;
};

/**
 * Goal service - Logic for user goals
 */
export interface GetGoalsParams {
  status?: 'active' | 'completed' | 'abandoned';
  category?: string;
  sort?: 'created_at' | 'name';
  order?: 'asc' | 'desc';
}

export const goalService = {
  /**
   * Get all goals for a user with optional filters and sorting
   */
  async getGoals(supabase: SupabaseClient<Database>, userId: string, params?: GetGoalsParams) {
    if (!userId) return { data: null, error: 'User ID is required' };

    let query = supabase.from('neolog_goals').select('*').eq('user_id', userId);

    // Apply filters
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.category) {
      query = query.eq('category', params.category);
    }

    // Apply sorting
    const sortBy = params?.sort || 'created_at';
    const ascending = params?.order === 'asc';
    query = query.order(sortBy, { ascending });

    const { data, error } = await query;

    if (error) return { data: null, error: error.message };
    return { data: data.map(serverConvertGoal), error: null };
  },

  /**
   * Get a single goal by ID
   */
  async getGoal(supabase: SupabaseClient<Database>, userId: string, goalId: string) {
    if (!userId || !goalId) return { data: null, error: 'User ID and Goal ID are required' };

    const { data, error } = await supabase
      .from('neolog_goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Goal not found' };
      }
      return { data: null, error: error.message };
    }
    return { data: serverConvertGoal(data), error: null };
  },

  /**
   * Create a new goal
   */
  async createGoal(supabase: SupabaseClient<Database>, userId: string, goal: GoalCreateRequest) {
    if (!userId) return { data: null, error: 'User ID is required' };
    const { data, error } = await supabase
      .from('neolog_goals')
      // FIXME
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      .insert({
        ...goal,
        user_id: userId,
        updated_at: new Date().toISOString(),
      } as Database['public']['Tables']['neolog_goals']['Insert'])
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: serverConvertGoal(data), error: null };
  },

  /**
   * Update an existing goal
   */
  async updateGoal(
    supabase: SupabaseClient<Database>,
    userId: string,
    goalId: string,
    updates: Partial<GoalCreateRequest>,
  ) {
    if (!userId || !goalId) return { data: null, error: 'User ID and Goal ID are required' };
    const { data, error } = await supabase
      .from('neolog_goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: serverConvertGoal(data), error: null };
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
