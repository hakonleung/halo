// Database schema (Drizzle table definitions)
export {
  neologUserSettings,
  neologBehaviorDefinitions,
  neologBehaviorRecords,
  neologGoals,
  neologNotes,
  neologUserProfiles,
  neologConversations,
  neologEquityList,
  neologEquityDaily,
  neologMessages,
} from './db/schema';

// Database type (Supabase-compatible)
export type { Database } from './types/database';

// Supabase server clients
export {
  getSupabaseClient,
  getSupabaseClientForApiRoute,
  getSupabaseClientForMiddleware,
} from './services/supabase-server';

// API handler factory + response type
export { createApiHandler } from './services/api-helpers';
export type { ApiResponse } from './services/api-helpers';
