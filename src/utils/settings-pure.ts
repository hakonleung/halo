import type { Settings, SettingsUpdateRequest } from '@/types/settings-client';

/**
 * Pure functions for settings validation and transformation
 */

/**
 * Validate username
 * @param username - Username to validate
 * @returns Error message if invalid, null if valid
 */
export function validateUsername(username: string | null | undefined): string | null {
  if (!username) {
    return null; // Username is optional
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (username.length > 30) {
    return 'Username must be less than 30 characters';
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return 'Username can only contain letters, numbers, underscores, and hyphens';
  }
  return null;
}

/**
 * Validate accent color hex code
 * @param color - Color hex code to validate
 * @returns Error message if invalid, null if valid
 */
export function validateAccentColor(color: string | null | undefined): string | null {
  if (!color) {
    return null; // Color is optional
  }
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return 'Invalid color format. Use hex format like #00FF41';
  }
  return null;
}

/**
 * Validate time format (HH:MM)
 * @param time - Time string to validate
 * @returns Error message if invalid, null if valid
 */
export function validateTime(time: string | null | undefined): string | null {
  if (!time) {
    return null; // Time is optional
  }
  if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
    return 'Invalid time format. Use HH:MM format like 23:00';
  }
  return null;
}

/**
 * Validate do not disturb time range
 * @param start - Start time
 * @param end - End time
 * @returns Error message if invalid, null if valid
 */
export function validateDoNotDisturbTimeRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string | null {
  if (!start || !end) {
    return null; // Both are optional
  }
  const startError = validateTime(start);
  if (startError) {
    return startError;
  }
  const endError = validateTime(end);
  if (endError) {
    return endError;
  }
  // If both are set, they should be different
  if (start === end) {
    return 'Start time and end time must be different';
  }
  return null;
}

/**
 * Get default settings
 * @returns Default settings object
 */
export function getDefaultSettings(): Partial<Settings> {
  return {
    theme: 'dark',
    accent_color: '#00FF41',
    animation_level: 'full',
    font_size: 'medium',
    code_font: 'JetBrains Mono',
    notifications_in_app: true,
    notifications_push: false,
    notifications_email: false,
    goal_reminder_enabled: true,
    record_reminder_enabled: false,
    insights_enabled: true,
    do_not_disturb_weekends: false,
    language: 'en',
    timezone: 'UTC',
    date_format: 'YYYY-MM-DD',
    currency: 'CNY',
    shortcuts: {},
  };
}

/**
 * Merge settings with updates
 * @param current - Current settings
 * @param updates - Settings updates
 * @returns Merged settings
 */
export function mergeSettingsUpdates(
  current: Settings | null,
  updates: SettingsUpdateRequest,
): SettingsUpdateRequest {
  if (!current) {
    return updates;
  }
  return {
    ...updates,
    // Only include fields that are being updated
  };
}

/**
 * Check if settings have unsaved changes
 * @param original - Original settings
 * @param current - Current settings values
 * @returns True if there are unsaved changes
 */
export function hasUnsavedChanges(original: Settings | null, current: Partial<Settings>): boolean {
  if (!original) {
    return Object.keys(current).length > 0;
  }
  return Object.keys(current).some((key) => {
    const typedKey = key as keyof Settings;
    return original[typedKey] !== current[typedKey];
  });
}

/**
 * Get preset accent colors
 * @returns Array of preset color options
 */
export function getPresetAccentColors(): Array<{ label: string; value: string }> {
  return [
    { label: 'Matrix Green', value: '#00FF41' },
    { label: 'Electric Blue', value: '#00D4FF' },
    { label: 'Neon Purple', value: '#BF00FF' },
    { label: 'Alert Orange', value: '#FF6B35' },
  ];
}

/**
 * Format timezone display name
 * @param timezone - Timezone string (e.g., 'UTC', 'Asia/Shanghai')
 * @returns Formatted timezone display name
 */
export function formatTimezone(timezone: string): string {
  // Simple formatting, can be enhanced with timezone library
  return timezone.replace(/_/g, ' ');
}

/**
 * Get available languages
 * @returns Array of language options
 */
export function getAvailableLanguages(): Array<{ label: string; value: string }> {
  return [
    { label: 'English', value: 'en' },
    { label: '简体中文', value: 'zh-CN' },
    { label: '繁體中文', value: 'zh-TW' },
  ];
}

/**
 * Get available date formats
 * @returns Array of date format options
 */
export function getAvailableDateFormats(): Array<{ label: string; value: string }> {
  return [
    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  ];
}

/**
 * Get available font sizes
 * @returns Array of font size options
 */
export function getAvailableFontSizes(): Array<{ label: string; value: string }> {
  return [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
    { label: 'Extra Large', value: 'xlarge' },
  ];
}

/**
 * Get available animation levels
 * @returns Array of animation level options
 */
export function getAvailableAnimationLevels(): Array<{ label: string; value: string }> {
  return [
    { label: 'Full', value: 'full' },
    { label: 'Reduced', value: 'reduced' },
    { label: 'None', value: 'none' },
  ];
}

/**
 * Get available themes
 * @returns Array of theme options
 */
export function getAvailableThemes(): Array<{ label: string; value: string }> {
  return [
    { label: 'Dark', value: 'dark' },
    { label: 'Light', value: 'light' },
    { label: 'System', value: 'system' },
  ];
}
