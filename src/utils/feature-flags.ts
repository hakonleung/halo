/**
 * Feature Flags Configuration
 *
 * Centralized feature flag system for controlling feature visibility
 * and enabling/disabling features across the application.
 */

export enum FeatureFlag {
  Notifications = 'notifications',
  // Add more feature flags here as needed
}

/**
 * Feature flags configuration
 * Set to `true` to enable a feature, `false` to disable it
 */
export const featureFlags: Record<FeatureFlag, boolean> = {
  [FeatureFlag.Notifications]: false,
  // Add more feature flags here as needed
};

/**
 * Check if a feature is enabled
 * @param flag - The feature flag to check
 * @returns `true` if the feature is enabled, `false` otherwise
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag] ?? false;
}
