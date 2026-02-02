import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type {
  BehaviorDefinition,
  BehaviorRecord,
  BehaviorRecordWithDefinition,
  BehaviorDefinitionCreateRequest,
  BehaviorRecordCreateRequest,
} from '@/types/behavior-server';
import type { InferSelectModel } from 'drizzle-orm';
import type { neologBehaviorDefinitions, neologBehaviorRecords } from '@/db/schema';

export const serverConvertBehaviorDefinition = (
  server: InferSelectModel<typeof neologBehaviorDefinitions>,
): BehaviorDefinition => {
  // FIXME
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return server as BehaviorDefinition;
};

export const serverConvertBehaviorRecord = (
  server: InferSelectModel<typeof neologBehaviorRecords>,
): BehaviorRecord => {
  // FIXME
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return server as BehaviorRecord;
};

/**
 * Behavior service - Logic for behavior definitions and records
 */
export const behaviorService = {
  /**
   * Get all behavior definitions for a user (including system ones)
   */
  async getDefinitions(supabase: SupabaseClient<Database>, userId: string) {
    if (!userId) throw new Error('User ID is required');
    const { data, error } = await supabase
      .from('neolog_behavior_definitions')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('usage_count', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(serverConvertBehaviorDefinition);
  },

  /**
   * Create a new behavior definition
   */
  async createDefinition(
    supabase: SupabaseClient<Database>,
    userId: string,
    definition: BehaviorDefinitionCreateRequest,
  ) {
    if (!userId) throw new Error('User ID is required');
    const { data, error } = await supabase
      .from('neolog_behavior_definitions')
      // FIXME
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      .insert({
        ...definition,
        user_id: userId,
        updated_at: new Date().toISOString(),
      } as Database['public']['Tables']['neolog_behavior_definitions']['Insert'])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return serverConvertBehaviorDefinition(data);
  },

  /**
   * Get behavior records for a user
   */
  async getRecords(supabase: SupabaseClient<Database>, userId: string, limit = 50, offset = 0) {
    if (!userId) throw new Error('User ID is required');
    const { data, error } = await supabase
      .from('neolog_behavior_records')
      .select('*, behavior_definitions:neolog_behavior_definitions(*)')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    const ans: BehaviorRecordWithDefinition[] = data.map((record) => ({
      ...serverConvertBehaviorRecord(record),
      behavior_definitions: serverConvertBehaviorDefinition(record.behavior_definitions),
    }));
    return ans;
  },

  /**
   * Create a new behavior record
   */
  async createRecord(
    supabase: SupabaseClient<Database>,
    userId: string,
    record: BehaviorRecordCreateRequest,
  ) {
    if (!userId) throw new Error('User ID is required');
    const { data, error } = await supabase
      .from('neolog_behavior_records')
      // FIXME
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      .insert({
        ...record,
        user_id: userId,
      } as Database['public']['Tables']['neolog_behavior_records']['Insert'])
      .select()
      .single();
    if (error) throw new Error(error.message);
    // Increment usage_count on the definition using the RPC
    if (record.definition_id) {
      await supabase.rpc('increment_behavior_usage', { def_id: record.definition_id });
    }
    return serverConvertBehaviorRecord(data);
  },

  /**
   * Update a behavior record
   */
  async updateRecord(
    supabase: SupabaseClient<Database>,
    userId: string,
    recordId: string,
    updates: Partial<BehaviorRecordCreateRequest>,
  ) {
    if (!userId || !recordId) throw new Error('User ID and Record ID are required');
    const { data, error } = await supabase
      .from('neolog_behavior_records')
      .update(updates)
      .eq('id', recordId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return serverConvertBehaviorRecord(data);
  },

  /**
   * Delete a behavior record
   */
  async deleteRecord(
    supabase: SupabaseClient<Database>,
    userId: string,
    recordId: string,
  ): Promise<void> {
    if (!userId || !recordId) throw new Error('User ID and Record ID are required');
    const { error } = await supabase
      .from('neolog_behavior_records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  },

  /**
   * Update a behavior definition
   */
  async updateDefinition(
    supabase: SupabaseClient<Database>,
    userId: string,
    definitionId: string,
    updates: Partial<BehaviorDefinitionCreateRequest>,
  ) {
    if (!userId || !definitionId) throw new Error('User ID and Definition ID are required');

    // First, check if the definition exists and belongs to the user
    const { data: existingDefinition, error: checkError } = await supabase
      .from('neolog_behavior_definitions')
      .select('id, user_id')
      .eq('id', definitionId)
      .maybeSingle();

    if (checkError) throw new Error(checkError.message);
    if (!existingDefinition) throw new Error('Definition not found');
    if (existingDefinition.user_id !== userId) {
      throw new Error('You do not have permission to update this definition');
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are provided
    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.category !== undefined) updatePayload.category = updates.category;
    if (updates.icon !== undefined) updatePayload.icon = updates.icon;
    if (updates.metadata_schema !== undefined)
      updatePayload.metadata_schema = updates.metadata_schema;

    const { data, error } = await supabase
      .from('neolog_behavior_definitions')
      .update(
        // FIXME
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        updatePayload as Database['public']['Tables']['neolog_behavior_definitions']['Update'],
      )
      .eq('id', definitionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Failed to update definition');
    return serverConvertBehaviorDefinition(data);
  },
};
