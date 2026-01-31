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
