/**
 * Design Tokens - Glassmorphism
 * Glass effect presets for NEO-LOG cyberpunk theme
 */

export const glass = {
  bg: { value: 'rgba(26, 26, 26, 0.8)' },
  bgHeavy: { value: 'rgba(26, 26, 26, 0.95)' },
  border: { value: 'rgba(0, 255, 65, 0.2)' },
  borderHover: { value: 'rgba(0, 255, 65, 0.4)' },
} as const;

export const glow = {
  sm: { value: '0 0 5px rgba(0, 255, 65, 0.3)' },
  md: { value: '0 0 10px rgba(0, 255, 65, 0.3), 0 0 20px rgba(0, 255, 65, 0.1)' },
  lg: { value: '0 0 15px rgba(0, 255, 65, 0.4), 0 0 30px rgba(0, 255, 65, 0.2)' },
  error: { value: '0 0 10px rgba(255, 51, 102, 0.3), 0 0 20px rgba(255, 51, 102, 0.1)' },
  errorSm: { value: '0 0 10px rgba(255, 51, 102, 0.3)' },
  cyber: { value: '0 0 10px rgba(0, 212, 255, 0.3), 0 0 20px rgba(0, 212, 255, 0.1)' },
  thumb: { value: '0 0 8px rgba(0, 255, 65, 0.5)' },
  badge: { value: '0 0 8px rgba(0, 255, 65, 0.1)' },
  tabIndicator: { value: '0 0 8px rgba(0, 255, 65, 0.5)' },
  drop: { value: '0 2px 4px rgba(0, 0, 0, 0.3)' },
  drawer: { value: '-5px 0 15px rgba(0, 255, 65, 0.1)' },
  subtle: { value: '0 0 15px rgba(0, 255, 65, 0.1)' },
} as const;

/**
 * CSS properties for glassmorphism effect
 * Use with style prop or recipe definition
 */
export const glassStyles = {
  background: 'transparent',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
} as const;
