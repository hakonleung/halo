import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { HistoryItem, HistoryListRequest, HistoryListResponse } from '@/types/history-server';
import { HistoryItemType } from '@/types/history-server';
import type { BehaviorRecordWithDefinition } from '@/types/behavior-server';
import type { Goal } from '@/types/goal-server';
import type { Note } from '@/types/note-server';

/**
 * History service - Aggregates behavior records, goals, and notes
 */
export const historyService = {
  /**
   * Get unified history list
   */
  async getHistory(
    supabase: SupabaseClient<Database>,
    userId: string,
    params: HistoryListRequest,
  ): Promise<HistoryListResponse> {
    const {
      type = 'all',
      startDate,
      endDate,
      search,
      page = 1,
      pageSize = 20,
      sortOrder = 'desc',
    } = params;

    const offset = (page - 1) * pageSize;
    const items: HistoryItem[] = [];
    let total = 0;

    // Fetch Behavior Records
    if (type === 'all' || type === 'behavior') {
      let query = supabase
        .from('neolog_behavior_records')
        .select('*, behavior_definitions:neolog_behavior_definitions(*)', { count: 'exact' })
        .eq('user_id', userId);

      if (startDate) query = query.gte('recorded_at', startDate);
      if (endDate) query = query.lte('recorded_at', endDate);
      if (search) query = query.ilike('note', `%${search}%`);

      const { data, count, error } = await query
        .order('recorded_at', { ascending: sortOrder === 'asc' })
        .range(offset, offset + pageSize - 1);

      if (!error && data) {
        total += count || 0;
        data.forEach((record) => {
          items.push({
            id: record.id,
            type: HistoryItemType.Behavior,
            createdAt: record.created_at || '',
            updatedAt: record.created_at || '', // Behavior records don't have updated_at yet
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            data: record as unknown as BehaviorRecordWithDefinition,
          });
        });
      }
    }

    // Fetch Goals
    if (type === 'all' || type === 'goal') {
      let query = supabase
        .from('neolog_goals')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);
      if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

      const { data, count, error } = await query
        .order('created_at', { ascending: sortOrder === 'asc' })
        .range(offset, offset + pageSize - 1);

      if (!error && data) {
        total += count || 0;
        data.forEach((goal) => {
          items.push({
            id: goal.id,
            type: HistoryItemType.Goal,
            createdAt: goal.created_at || '',
            updatedAt: goal.updated_at || '',
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            data: goal as Goal,
          });
        });
      }
    }

    // Fetch Notes
    if (type === 'all' || type === 'note') {
      let query = supabase
        .from('neolog_notes')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);
      if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);

      const { data, count, error } = await query
        .order('created_at', { ascending: sortOrder === 'asc' })
        .range(offset, offset + pageSize - 1);

      if (!error && data) {
        total += count || 0;
        data.forEach((note) => {
          items.push({
            id: note.id,
            type: HistoryItemType.Note,
            createdAt: note.created_at || '',
            updatedAt: note.updated_at || '',
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            data: note as Note,
          });
        });
      }
    }

    // Sort items if type is 'all'
    if (type === 'all') {
      items.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
      // Re-apply pagination after merging and sorting
      // This is a simplified implementation. For large datasets, a more complex SQL union or separate pagination would be needed.
    }

    return {
      items: items.slice(0, pageSize),
      total,
      page,
      pageSize,
      hasMore: total > page * pageSize,
    };
  },
};
