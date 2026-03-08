/**
 * 3D Scene Configuration
 *
 * Central configuration for 3D chat scene dimensions, camera, performance targets, etc.
 */

/**
 * Room dimensions
 */
export const ROOM_SIZE = {
  width: 10,
  height: 3,
  depth: 10,
} as const;

/**
 * Camera configuration
 */
export const CAMERA_CONFIG = {
  position: { x: 0, y: 1.6, z: 5 }, // Human eye height
  fov: 60,
  near: 0.1,
  far: 100,
} as const;

/**
 * Wall-mounted screen configuration
 */
export const COMPUTER_CONFIG = {
  position: { x: 0, y: 1.5, z: -2 }, // Closer to camera for better visibility
  screenSize: { width: 3, height: 2 }, // Larger screen on wall
  screenResolution: {
    desktop: 1024,
    mobile: 512,
  },
  maxVisibleMessages: 5,
} as const;

/**
 * Character configuration
 */
export const CHARACTER_CONFIG = {
  position: { x: -2, y: 0, z: 0 }, // Left of computer (y=0 is floor level)
  scale: 1.0,
  modelPath: '/models/characters/',
  // Characters that should keep their original materials/colors
  keepOriginalMaterials: ['gugugaga'],
} as const;

/**
 * Performance targets
 */
export const PERFORMANCE_TARGETS = {
  targetFPS: {
    desktop: 60,
    mobile: 30,
  },
  maxDrawCalls: 50,
  maxMemoryMB: 200,
} as const;

/**
 * Mobile-specific optimizations
 */
export const MOBILE_OPTIMIZATIONS = {
  enableShadows: {
    desktop: true,
    mobile: false,
  },
  textureResolution: {
    desktop: 1024,
    mobile: 512,
  },
  characterPolygons: {
    desktop: 10000,
    mobile: 5000,
  },
  particleEffects: {
    desktop: true,
    mobile: false,
  },
} as const;

/**
 * Lighting configuration
 */
export const LIGHTING_CONFIG = {
  ambient: {
    color: 0x222222,
    intensity: 0.4,
  },
  matrixLight: {
    color: 0x00ff41, // Matrix green
    intensity: 0.8,
    position: { x: -3, y: 2, z: 2 },
    distance: 10,
  },
  cyberLight: {
    color: 0x00d4ff, // Cyber blue
    intensity: 0.6,
    position: { x: 3, y: 2, z: 2 },
    distance: 10,
  },
} as const;

/**
 * Window configuration
 */
export const WINDOW_CONFIG = {
  position: { x: -4.9, y: 1.5, z: -4 },
  size: { width: 2, height: 1.5 },
  emissiveIntensity: 0.2,
} as const;

/**
 * Combined scene configuration
 * Used by mobile-optimizations.ts
 */
export const SCENE_CONFIGS = {
  ROOM_SIZE,
  CAMERA: CAMERA_CONFIG,
  COMPUTER: COMPUTER_CONFIG,
  PERFORMANCE: PERFORMANCE_TARGETS,
  MOBILE_OPTIMIZATIONS,
} as const;
