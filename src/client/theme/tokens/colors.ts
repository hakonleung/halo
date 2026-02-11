/**
 * Design Tokens - Colors
 * Cyberpunk color palette for NEO-LOG
 */

export const colors = {
  brand: {
    matrix: { value: '#00FF41' },
    matrixDark: { value: '#00CC33' },
    alert: { value: '#FF6B35' },
    cyber: { value: '#00D4FF' },
  },
  bg: {
    deep: { value: '#0A0A0A' },
    carbon: { value: '#1A1A1A' },
    dark: { value: '#2A2A2A' },
    grid: { value: '#333333' },
    axis: { value: '#555555' },
  },
  text: {
    neon: { value: '#E0E0E0' },
    mist: { value: '#888888' },
    dim: { value: '#555555' },
  },
  semantic: {
    success: { value: '#00FF41' },
    warning: { value: '#FFD700' },
    error: { value: '#FF3366' },
    info: { value: '#00D4FF' },
  },
} as const;

export const alphaColors = {
  // Matrix green alpha variants
  'matrix/2': { value: 'rgba(0, 255, 65, 0.02)' },
  'matrix/3': { value: 'rgba(0, 255, 65, 0.03)' },
  'matrix/5': { value: 'rgba(0, 255, 65, 0.05)' },
  'matrix/10': { value: 'rgba(0, 255, 65, 0.1)' },
  'matrix/15': { value: 'rgba(0, 255, 65, 0.15)' },
  'matrix/20': { value: 'rgba(0, 255, 65, 0.2)' },
  'matrix/30': { value: 'rgba(0, 255, 65, 0.3)' },
  'matrix/40': { value: 'rgba(0, 255, 65, 0.4)' },
  'matrix/50': { value: 'rgba(0, 255, 65, 0.5)' },
  'matrix/60': { value: 'rgba(0, 255, 65, 0.6)' },
  'matrix/80': { value: 'rgba(0, 255, 65, 0.8)' },
  'matrix/90': { value: 'rgba(0, 255, 65, 0.9)' },

  // Error alpha variants
  'error/10': { value: 'rgba(255, 51, 102, 0.1)' },
  'error/20': { value: 'rgba(255, 51, 102, 0.2)' },
  'error/30': { value: 'rgba(255, 51, 102, 0.3)' },

  // Warning alpha variants
  'warning/20': { value: 'rgba(255, 215, 0, 0.2)' },

  // Info / Cyber alpha variants
  'info/20': { value: 'rgba(0, 212, 255, 0.2)' },
  'cyber/20': { value: 'rgba(0, 212, 255, 0.2)' },
  'cyber/30': { value: 'rgba(0, 212, 255, 0.3)' },

  // Alert alpha variants
  'alert/10': { value: 'rgba(255, 107, 53, 0.1)' },
  'alert/20': { value: 'rgba(255, 107, 53, 0.2)' },

  // Neutral alpha variants
  'mist/20': { value: 'rgba(136, 136, 136, 0.2)' },
  'black/20': { value: 'rgba(0, 0, 0, 0.2)' },
  'black/30': { value: 'rgba(0, 0, 0, 0.3)' },
  'black/40': { value: 'rgba(0, 0, 0, 0.4)' },
  'white/5': { value: 'rgba(255, 255, 255, 0.05)' },
  'white/10': { value: 'rgba(255, 255, 255, 0.1)' },
} as const;
