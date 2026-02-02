import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { neologUserSettings } from '@/db/schema';

// Server-side types for settings (Inferred from Drizzle Entity)
export type UserSettings = InferSelectModel<typeof neologUserSettings>;

export enum AIProvider {
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Google = 'google',
  Custom = 'custom',
}

export interface AISettings {
  useDefaultKey: boolean;
  selectedProvider: AIProvider;
  selectedModel: string;
  temperature: number;
  streamEnabled: boolean;
  apiKey?: string | null;
  baseUrl?: string | null;
}

export type SettingsUpdateRequest = Partial<InferInsertModel<typeof neologUserSettings>>;

export interface SettingsResponse {
  settings: UserSettings | null;
  error: string | null;
}
