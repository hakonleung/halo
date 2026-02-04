/**
 * Design Tokens - Colors
 * Cyberpunk color palette for NEO-LOG
 */

export const colors = {
  brand: {
    matrix: { value: '#00FF41' },
    alert: { value: '#FF6B35' },
    cyber: { value: '#00D4FF' },
  },
  bg: {
    deep: { value: '#0A0A0A' },
    carbon: { value: '#1A1A1A' },
    dark: { value: '#2A2A2A' },
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
  'matrix/10': { value: 'rgba(0, 255, 65, 0.1)' },
  'matrix/20': { value: 'rgba(0, 255, 65, 0.2)' },
  'matrix/30': { value: 'rgba(0, 255, 65, 0.3)' },
  'matrix/50': { value: 'rgba(0, 255, 65, 0.5)' },
  'error/10': { value: 'rgba(255, 51, 102, 0.1)' },
  'error/20': { value: 'rgba(255, 51, 102, 0.2)' },
  'warning/20': { value: 'rgba(255, 215, 0, 0.2)' },
  'info/20': { value: 'rgba(0, 212, 255, 0.2)' },
} as const;
