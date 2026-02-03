/**
 * Settings API
 */

import { BaseApiService, type ApiResponse } from './base';
import {
  type UserSettings as ServerUserSettings,
  type SettingsUpdateRequest as ServerSettingsUpdateRequest,
  type AISettings,
  AIProvider,
} from '@/types/settings-server';
import type {
  Settings as ClientSettings,
  SettingsUpdateRequest as ClientSettingsUpdateRequest,
} from '@/types/settings-client';

export const convertAISettings = (server: unknown): AISettings => {
  const ans: AISettings = {
    useDefaultKey: true,
    selectedProvider: AIProvider.OpenAI,
    selectedModel: 'gpt-4o',
    temperature: 0.7,
    streamEnabled: true,
    apiKey: null,
    baseUrl: null,
  };
  if (typeof server === 'object' && server !== null) {
    ans.useDefaultKey = 'useDefaultKey' in server && server.useDefaultKey === true;
    ans.selectedProvider =
      'selectedProvider' in server && typeof server.selectedProvider === 'string'
        ? Object.values(AIProvider).find((p) => p === server.selectedProvider) || AIProvider.OpenAI
        : AIProvider.OpenAI;
    ans.selectedModel =
      'selectedModel' in server && typeof server.selectedModel === 'string'
        ? server.selectedModel
        : 'gpt-4o';
    ans.temperature =
      'temperature' in server && typeof server.temperature === 'number' ? server.temperature : 0.7;
    ans.streamEnabled =
      'streamEnabled' in server && typeof server.streamEnabled === 'boolean'
        ? server.streamEnabled
        : true;
    ans.apiKey =
      'apiKey' in server && (server.apiKey === null || typeof server.apiKey === 'string')
        ? server.apiKey
        : null;
    ans.baseUrl =
      'baseUrl' in server && (server.baseUrl === null || typeof server.baseUrl === 'string')
        ? server.baseUrl
        : null;
  }
  return ans;
};

export function convertSettings(server: ServerUserSettings): ClientSettings {
  return {
    id: server.id,
    updatedAt: server.updated_at ?? new Date().toISOString(),
    username: server.username ?? null,
    fullName: server.full_name ?? null,
    avatarUrl: server.avatar_url ?? null,
    website: server.website ?? null,
    theme: server.theme ?? null,
    accentColor: server.accent_color ?? null,
    animationLevel: server.animation_level ?? null,
    fontSize: server.font_size ?? null,
    codeFont: server.code_font ?? null,
    notificationsInApp: server.notifications_in_app ?? null,
    notificationsPush: server.notifications_push ?? null,
    notificationsEmail: server.notifications_email ?? null,
    goalReminderEnabled: server.goal_reminder_enabled ?? null,
    recordReminderEnabled: server.record_reminder_enabled ?? null,
    insightsEnabled: server.insights_enabled ?? null,
    doNotDisturbStart: server.do_not_disturb_start ?? null,
    doNotDisturbEnd: server.do_not_disturb_end ?? null,
    doNotDisturbWeekends: server.do_not_disturb_weekends ?? null,
    language: server.language ?? null,
    timezone: server.timezone ?? null,
    dateFormat: server.date_format ?? null,
    currency: server.currency ?? null,
    aiSettings: convertAISettings(server.ai_settings),
  };
}

function convertSettingsUpdateRequest(
  client: ClientSettingsUpdateRequest,
): ServerSettingsUpdateRequest {
  const server: ServerSettingsUpdateRequest = {};
  if (client.username !== undefined) server.username = client.username;
  if (client.fullName !== undefined) server.full_name = client.fullName;
  if (client.avatarUrl !== undefined) server.avatar_url = client.avatarUrl;
  if (client.website !== undefined) server.website = client.website;
  if (client.theme !== undefined) server.theme = client.theme;
  if (client.accentColor !== undefined) server.accent_color = client.accentColor;
  if (client.animationLevel !== undefined) server.animation_level = client.animationLevel;
  if (client.fontSize !== undefined) server.font_size = client.fontSize;
  if (client.codeFont !== undefined) server.code_font = client.codeFont;
  if (client.notificationsInApp !== undefined)
    server.notifications_in_app = client.notificationsInApp;
  if (client.notificationsPush !== undefined) server.notifications_push = client.notificationsPush;
  if (client.notificationsEmail !== undefined)
    server.notifications_email = client.notificationsEmail;
  if (client.goalReminderEnabled !== undefined)
    server.goal_reminder_enabled = client.goalReminderEnabled;
  if (client.recordReminderEnabled !== undefined)
    server.record_reminder_enabled = client.recordReminderEnabled;
  if (client.insightsEnabled !== undefined) server.insights_enabled = client.insightsEnabled;
  if (client.doNotDisturbStart !== undefined)
    server.do_not_disturb_start = client.doNotDisturbStart;
  if (client.doNotDisturbEnd !== undefined) server.do_not_disturb_end = client.doNotDisturbEnd;
  if (client.doNotDisturbWeekends !== undefined)
    server.do_not_disturb_weekends = client.doNotDisturbWeekends;
  if (client.language !== undefined) server.language = client.language;
  if (client.timezone !== undefined) server.timezone = client.timezone;
  if (client.dateFormat !== undefined) server.date_format = client.dateFormat;
  if (client.currency !== undefined) server.currency = client.currency;
  if (client.aiSettings !== undefined) server.ai_settings = client.aiSettings;
  return server;
}

export const settingsApi = {
  /**
   * Get user settings
   */
  async getSettings(): Promise<ClientSettings | null> {
    const response =
      await BaseApiService.fetchApi<ApiResponse<ServerUserSettings>>('/api/settings');
    if ('error' in response) {
      throw new Error(response.error);
    }
    return convertSettings(response.data);
  },

  /**
   * Update user settings
   */
  async updateSettings(updates: ClientSettingsUpdateRequest): Promise<ClientSettings> {
    const serverRequest = convertSettingsUpdateRequest(updates);

    const response = await BaseApiService.fetchApi<ApiResponse<ServerUserSettings>>(
      '/api/settings',
      {
        method: 'PATCH',
        body: JSON.stringify(serverRequest),
      },
    );

    if ('error' in response) {
      throw new Error(response.error);
    }

    return convertSettings(response.data);
  },
};
