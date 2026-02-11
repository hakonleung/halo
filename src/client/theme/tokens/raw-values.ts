/**
 * Raw Token Values
 * Plain string constants for use in non-Chakra contexts
 * (Recharts, emoji-mart, SVG, CSS variables, etc.)
 *
 * These values are the single source of truth and match the Chakra token definitions.
 */

export const RAW_COLORS = {
  // Brand
  matrix: '#00FF41',
  matrixDark: '#00CC33',
  alert: '#FF6B35',
  cyber: '#00D4FF',

  // Background
  bgDeep: '#0A0A0A',
  bgCarbon: '#1A1A1A',
  bgDark: '#2A2A2A',
  bgGrid: '#333333',
  bgAxis: '#555555',

  // Text
  textNeon: '#E0E0E0',
  textMist: '#888888',
  textDim: '#555555',

  // Semantic
  success: '#00FF41',
  warning: '#FFD700',
  error: '#FF3366',
  info: '#00D4FF',

  // Alpha - Matrix
  matrix2: 'rgba(0, 255, 65, 0.02)',
  matrix3: 'rgba(0, 255, 65, 0.03)',
  matrix5: 'rgba(0, 255, 65, 0.05)',
  matrix10: 'rgba(0, 255, 65, 0.1)',
  matrix15: 'rgba(0, 255, 65, 0.15)',
  matrix20: 'rgba(0, 255, 65, 0.2)',
  matrix30: 'rgba(0, 255, 65, 0.3)',
  matrix40: 'rgba(0, 255, 65, 0.4)',
  matrix50: 'rgba(0, 255, 65, 0.5)',
  matrix60: 'rgba(0, 255, 65, 0.6)',
  matrix80: 'rgba(0, 255, 65, 0.8)',
  matrix90: 'rgba(0, 255, 65, 0.9)',

  // Alpha - Error
  error10: 'rgba(255, 51, 102, 0.1)',
  error20: 'rgba(255, 51, 102, 0.2)',
  error30: 'rgba(255, 51, 102, 0.3)',

  // Alpha - Cyber
  cyber20: 'rgba(0, 212, 255, 0.2)',
  cyber30: 'rgba(0, 212, 255, 0.3)',

  // Alpha - Alert
  alert10: 'rgba(255, 107, 53, 0.1)',
  alert20: 'rgba(255, 107, 53, 0.2)',

  // Alpha - Neutral
  mist20: 'rgba(136, 136, 136, 0.2)',
  warning20: 'rgba(255, 215, 0, 0.2)',
  info20: 'rgba(0, 212, 255, 0.2)',
  black20: 'rgba(0, 0, 0, 0.2)',
  black30: 'rgba(0, 0, 0, 0.3)',
  black40: 'rgba(0, 0, 0, 0.4)',
  white5: 'rgba(255, 255, 255, 0.05)',
  white10: 'rgba(255, 255, 255, 0.1)',
} as const;

export const RAW_SHADOWS = {
  sm: '0 0 5px rgba(0, 255, 65, 0.3)',
  md: '0 0 10px rgba(0, 255, 65, 0.3), 0 0 20px rgba(0, 255, 65, 0.1)',
  lg: '0 0 15px rgba(0, 255, 65, 0.4), 0 0 30px rgba(0, 255, 65, 0.2)',
  error: '0 0 10px rgba(255, 51, 102, 0.3), 0 0 20px rgba(255, 51, 102, 0.1)',
  cyber: '0 0 10px rgba(0, 212, 255, 0.3), 0 0 20px rgba(0, 212, 255, 0.1)',
  thumb: '0 0 8px rgba(0, 255, 65, 0.5)',
  drop: '0 2px 4px rgba(0, 0, 0, 0.3)',
  drawer: '-5px 0 15px rgba(0, 255, 65, 0.1)',
  badge: '0 0 8px rgba(0, 255, 65, 0.1)',
} as const;

export const RAW_FONTS = {
  heading: "'Orbitron', 'SF Pro Display', -apple-system, sans-serif",
  body: "'Rajdhani', 'SF Pro Display', -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
} as const;
