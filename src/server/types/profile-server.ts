import type { neologUserProfiles } from '@/server/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

// Server-side types for user profile (Inferred from Drizzle Entity)
export type UserProfileModel = InferSelectModel<typeof neologUserProfiles> & {
  portrait: UserPortrait;
  recent_emotions: EmotionEntry[];
  recent_behaviors: BehaviorSummary[];
};

/**
 * User portrait - AI-maintained understanding of the user
 */
export interface UserPortrait {
  nickname?: string;
  personality?: string[];
  interests?: string[];
  habits?: string[];
  goals?: string[];
  communication_style?: string;
  summary?: string;
}

/**
 * A single emotion entry tracked over time
 */
export interface EmotionEntry {
  emotion: string;
  intensity: number; // 1-10
  trigger?: string;
  timestamp: string; // ISO string
}

/**
 * A summary of recent user behavior patterns
 */
export interface BehaviorSummary {
  pattern: string;
  frequency?: string;
  context?: string;
  timestamp: string; // ISO string
}

/**
 * Request type for updating user profile via the profile agent
 */
export interface UpdateUserProfileRequest {
  portrait?: Partial<UserPortrait>;
  recent_emotions?: EmotionEntry[];
  recent_behaviors?: BehaviorSummary[];
}
