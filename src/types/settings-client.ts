import type { UserSettings, SettingsUpdateRequest as ServerUpdateRequest, AISettings } from './settings-server';

export type Settings = UserSettings;
export type SettingsUpdateRequest = ServerUpdateRequest;
export type { AISettings };

export interface SettingsResponse {
  settings: Settings | null;
  error: string | null;
}

export type SettingsUpdateField = keyof SettingsUpdateRequest;
