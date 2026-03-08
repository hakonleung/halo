/**
 * 3D Chat Scene Types
 *
 * Client-side types for 3D cyberpunk chat scene functionality.
 */

/**
 * Available character preset models
 */
export enum CharacterPreset {
  HACKER = 'hacker',
  ANDROID = 'android',
  CYBORG = 'cyborg',
  RUNNER = 'runner',
  NETIZEN = 'netizen',
}

/**
 * Material type for character customization
 */
export type MaterialType = 'glossy' | 'matte' | 'metallic';

/**
 * Character appearance customization options
 */
export interface CharacterCustomization {
  /** Primary color (hex) */
  primaryColor: string;
  /** Secondary/emissive color (hex) */
  secondaryColor: string;
  /** Material surface type */
  materialType: MaterialType;
  /** Model scale multiplier */
  scale: number;
}

/**
 * Complete 3D chat settings
 */
export interface Chat3DSettings {
  /** Whether 3D mode is enabled */
  enabled: boolean;
  /** Selected character preset */
  selectedCharacter: CharacterPreset;
  /** Character customization options */
  customization: CharacterCustomization;
}

/**
 * Default customization values
 */
export const DEFAULT_CUSTOMIZATION: CharacterCustomization = {
  primaryColor: '#00FF41', // Matrix green
  secondaryColor: '#00D4FF', // Cyber blue
  materialType: 'glossy',
  scale: 1.0,
};

/**
 * Default 3D settings
 */
export const DEFAULT_3D_SETTINGS: Chat3DSettings = {
  enabled: false,
  selectedCharacter: CharacterPreset.HACKER,
  customization: DEFAULT_CUSTOMIZATION,
};
