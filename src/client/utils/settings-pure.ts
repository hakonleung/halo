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
 * Preset accent colors
 */
export const PRESET_ACCENT_COLORS = [
  { label: 'Matrix Green', value: '#00FF41' },
  { label: 'Electric Blue', value: '#00D4FF' },
  { label: 'Neon Purple', value: '#BF00FF' },
  { label: 'Alert Orange', value: '#FF6B35' },
] as const;

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
 * Available languages
 */
export const AVAILABLE_LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: '简体中文', value: 'zh-CN' },
  { label: '繁體中文', value: 'zh-TW' },
] as const;

/**
 * Available date formats
 */
export const AVAILABLE_DATE_FORMATS = [
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
] as const;

/**
 * Available font sizes
 */
export const AVAILABLE_FONT_SIZES = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
  { label: 'Extra Large', value: 'xlarge' },
] as const;

/**
 * Available animation levels
 */
export const AVAILABLE_ANIMATION_LEVELS = [
  { label: 'Full', value: 'full' },
  { label: 'Reduced', value: 'reduced' },
  { label: 'None', value: 'none' },
] as const;

/**
 * Available themes
 */
export const AVAILABLE_THEMES = [
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
  { label: 'System', value: 'system' },
] as const;
