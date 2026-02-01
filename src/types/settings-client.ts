import type { AISettings } from './settings-server';

// Client-side Settings type with camelCase
export interface Settings {
  id: string;
  updatedAt: string;
  // Profile fields
  username?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  website?: string | null;
  // Appearance settings
  theme?: 'dark' | 'light' | 'system' | null;
  accentColor?: string | null;
  animationLevel?: 'full' | 'reduced' | 'none' | null;
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge' | null;
  codeFont?: string | null;
  // Notification settings
  notificationsInApp?: boolean | null;
  notificationsPush?: boolean | null;
  notificationsEmail?: boolean | null;
  goalReminderEnabled?: boolean | null;
  recordReminderEnabled?: boolean | null;
  insightsEnabled?: boolean | null;
  doNotDisturbStart?: string | null;
  doNotDisturbEnd?: string | null;
  doNotDisturbWeekends?: boolean | null;
  // Locale settings
  language?: 'en' | 'zh-CN' | 'zh-TW' | null;
  timezone?: string | null;
  dateFormat?: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | null;
  currency?: string | null;
  // AI Settings
  aiSettings?: AISettings | null;
}

// Client-side update request with camelCase
export type SettingsUpdateRequest = {
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  website?: string;
  theme?: 'dark' | 'light' | 'system';
  accentColor?: string;
  animationLevel?: 'full' | 'reduced' | 'none';
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  codeFont?: string;
  notificationsInApp?: boolean;
  notificationsPush?: boolean;
  notificationsEmail?: boolean;
  goalReminderEnabled?: boolean;
  recordReminderEnabled?: boolean;
  insightsEnabled?: boolean;
  doNotDisturbStart?: string;
  doNotDisturbEnd?: string;
  doNotDisturbWeekends?: boolean;
  language?: 'en' | 'zh-CN' | 'zh-TW';
  timezone?: string;
  dateFormat?: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
  currency?: string;
  aiSettings?: AISettings;
};

export type { AISettings };

export interface SettingsResponse {
  settings: Settings | null;
  error: string | null;
}

export type SettingsUpdateField = keyof SettingsUpdateRequest;
