import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import type {
  BehaviorDefinition,
  BehaviorRecord,
  BehaviorRecordWithDefinition,
  BehaviorDefinitionCreateRequest,
  BehaviorRecordCreateRequest,
} from '@/types/behavior-server';

/**
 * Behavior service - Logic for behavior definitions and records
 */
export const behaviorService = {
  /**
   * Get all behavior definitions for a user (including system ones)
   */
  async getDefinitions(supabase: SupabaseClient<Database>, userId: string) {
    if (!userId) return { data: null, error: 'User ID is required' };
    const { data, error } = await supabase
      .from('neolog_behavior_definitions')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('usage_count', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as BehaviorDefinition[], error: null };
  },

  /**
   * Create a new behavior definition
   */
  async createDefinition(
    supabase: SupabaseClient<Database>,
    userId: string,
    definition: BehaviorDefinitionCreateRequest
  ) {
    if (!userId) return { data: null, error: 'User ID is required' };
    const { data, error } = await supabase
      .from('neolog_behavior_definitions')
      .insert({
        ...definition,
        user_id: userId,
        updated_at: new Date().toISOString(),
      } as Database['public']['Tables']['neolog_behavior_definitions']['Insert'])
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as BehaviorDefinition, error: null };
  },

  /**
   * Get behavior records for a user
   */
  async getRecords(supabase: SupabaseClient<Database>, userId: string, limit = 50, offset = 0) {
    if (!userId) return { data: null, error: 'User ID is required' };
    const { data, error } = await supabase
      .from('neolog_behavior_records')
      .select('*, behavior_definitions:neolog_behavior_definitions(*)')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as BehaviorRecordWithDefinition[], error: null };
  },

  /**
   * Create a new behavior record
   */
  async createRecord(
    supabase: SupabaseClient<Database>,
    userId: string,
    record: BehaviorRecordCreateRequest
  ) {
    if (!userId) return { data: null, error: 'User ID is required' };
    const { data, error } = await supabase
      .from('neolog_behavior_records')
      .insert({
        ...record,
        user_id: userId,
      } as Database['public']['Tables']['neolog_behavior_records']['Insert'])
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    // Increment usage_count on the definition using the RPC
    if (record.definition_id) {
      await supabase.rpc('increment_behavior_usage', { def_id: record.definition_id });
    }

    return { data: data as BehaviorRecord, error: null };
  },

  /**
   * Delete a behavior record
   */
  async deleteRecord(supabase: SupabaseClient<Database>, userId: string, recordId: string) {
    if (!userId || !recordId) return { error: 'User ID and Record ID are required' };
    const { error } = await supabase
      .from('neolog_behavior_records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', userId);

    if (error) return { error: error.message };
    return { error: null };
  },
};

