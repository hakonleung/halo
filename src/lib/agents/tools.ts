import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { behaviorService } from '@/lib/behavior-service';
import type {
  BehaviorRecordCreateRequest,
  BehaviorDefinitionCreateRequest,
} from '@/types/behavior-server';

/**
 * Create tools for the AI agent
 */
export function createChatTools(supabase: SupabaseClient, userId: string) {
  return [
    new DynamicStructuredTool({
      name: 'get_behavior_definitions',
      description:
        'Get all available behavior definitions (e.g., Running, Coffee, Daily Expense) to understand what metadata they require.',
      schema: z.object({}),
      func: async () => {
        const res = await behaviorService.getDefinitions(supabase, userId);
        if (res.error) return `Error fetching definitions: ${res.error}`;
        return JSON.stringify(res.data);
      },
    }),

    new DynamicStructuredTool({
      name: 'record_behavior',
      description:
        'Record a specific behavior (e.g., "Running", "Coffee", "Daily Expense") with metadata.',
      schema: z.object({
        definition_id: z.string().describe('The ID of the behavior definition.'),
        metadata: z
          .record(z.string(), z.unknown())
          .describe('The metadata for the behavior, according to its schema.'),
        recorded_at: z
          .string()
          .optional()
          .describe('ISO timestamp of when the behavior occurred. Defaults to now.'),
        note: z.string().optional().describe('An optional note for the record.'),
      }),
      func: async (params) => {
        const res = await behaviorService.createRecord(
          supabase,
          userId,
          params as BehaviorRecordCreateRequest,
        );
        if (res.error) return `Error creating record: ${res.error}`;
        return `Record created successfully: ${JSON.stringify(res.data)}`;
      },
    }),

    new DynamicStructuredTool({
      name: 'create_behavior_definition',
      description: 'Create a new behavior definition if the user wants to track something new.',
      schema: z.object({
        name: z.string().describe('The name of the behavior (e.g., "Reading", "Yoga").'),
        category: z
          .enum(['health', 'expense', 'income', 'habit', 'other'])
          .describe('The category of the behavior.'),
        icon: z.string().optional().describe('A descriptive emoji.'),
        metadata_schema: z
          .array(z.unknown())
          .describe(
            'List of fields for the behavior. Each field has name, key, type, and required.',
          ),
      }),
      func: async (params) => {
        const res = await behaviorService.createDefinition(
          supabase,
          userId,
          params as BehaviorDefinitionCreateRequest,
        );
        if (res.error) return `Error creating definition: ${res.error}`;
        return `Definition created successfully: ${JSON.stringify(res.data)}`;
      },
    }),

    new DynamicStructuredTool({
      name: 'query_records',
      description: 'Query historical behavior records for the user.',
      schema: z.object({
        limit: z.number().default(10).describe('Max number of records to return.'),
        offset: z.number().default(0).describe('Pagination offset.'),
      }),
      func: async (params) => {
        const res = await behaviorService.getRecords(supabase, userId, params.limit, params.offset);
        if (res.error) return `Error querying records: ${res.error}`;
        return JSON.stringify(res.data);
      },
    }),
  ];
}
