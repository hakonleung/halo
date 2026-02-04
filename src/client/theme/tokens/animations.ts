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
  'tunnel-rotate': {
    '0%': {
      transform: 'rotate(0deg) scale(1)',
    },
    '50%': {
      transform: 'rotate(180deg) scale(1.5)',
    },
    '100%': {
      transform: 'rotate(360deg) scale(1)',
    },
  },
  'skeleton-pulse': {
    '0%': {
      transform: 'translateX(-100%)',
    },
    '100%': {
      transform: 'translateX(100%)',
    },
  },
  'skeleton-matrix': {
    '0%': {
      backgroundPosition: '200% 0',
      opacity: 0.3,
    },
    '50%': {
      opacity: 0.8,
    },
    '100%': {
      backgroundPosition: '-200% 0',
      opacity: 0.3,
    },
  },
  'skeleton-scan': {
    '0%': {
      transform: 'translateY(-100%)',
      opacity: 0,
    },
    '50%': {
      opacity: 1,
    },
    '100%': {
      transform: 'translateY(100%)',
      opacity: 0,
    },
  },
  'skeleton-glitch': {
    '0%, 100%': {
      transform: 'translateX(0)',
      filter: 'hue-rotate(0deg)',
    },
    '10%': {
      transform: 'translateX(-2px)',
      filter: 'hue-rotate(90deg)',
    },
    '20%': {
      transform: 'translateX(2px)',
      filter: 'hue-rotate(180deg)',
    },
    '30%': {
      transform: 'translateX(-1px)',
      filter: 'hue-rotate(270deg)',
    },
    '40%': {
      transform: 'translateX(1px)',
      filter: 'hue-rotate(360deg)',
    },
    '50%': {
      transform: 'translateX(0)',
      filter: 'hue-rotate(0deg)',
    },
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
