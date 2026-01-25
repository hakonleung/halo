import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { neologUserSettings } from '@/db/schema';

// Server-side types for settings (Inferred from Drizzle Entity)
export type UserSettings = InferSelectModel<typeof neologUserSettings>;

export interface AISettings {
  useDefaultKey: boolean;
  selectedProvider: 'openai' | 'anthropic' | 'google';
  selectedModel: string;
  temperature: number;
  streamEnabled: boolean;
  customKeys: Array<{
    provider: string;
    hasKey: boolean;
  }>;
}

export type SettingsUpdateRequest = Partial<InferInsertModel<typeof neologUserSettings>>;

export interface SettingsResponse {
  settings: UserSettings | null;
  error: string | null;
}
