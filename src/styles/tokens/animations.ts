/**
 * Design Tokens - Animations
 * Keyframe definitions for NEO-LOG cyberpunk effects
 */

export const keyframes = {
  'pulse-glow': {
    '0%, 100%': {
      boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)',
    },
    '50%': {
      boxShadow: '0 0 20px rgba(0, 255, 65, 0.6), 0 0 30px rgba(0, 255, 65, 0.3)',
    },
  },
  glitch: {
    '0%': { transform: 'translate(0)' },
    '20%': { transform: 'translate(-2px, 2px)' },
    '40%': { transform: 'translate(-2px, -2px)' },
    '60%': { transform: 'translate(2px, 2px)' },
    '80%': { transform: 'translate(2px, -2px)' },
    '100%': { transform: 'translate(0)' },
  },
  'scan-line': {
    '0%': { backgroundPosition: '0 0' },
    '100%': { backgroundPosition: '0 100px' },
  },
  'matrix-flow': {
    '0%': { backgroundPosition: '0% 0%' },
    '100%': { backgroundPosition: '0% 100%' },
  },
} as const;

export const durations = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
} as const;

export const easings = {
  easeOut: 'ease-out',
  easeIn: 'ease-in',
  easeInOut: 'ease-in-out',
} as const;
