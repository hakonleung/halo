import { defineRecipe } from '@chakra-ui/react';

export const skeleton = defineRecipe({
  className: 'neo-skeleton',
  base: {
    bg: 'bg.carbon',
    borderRadius: '4px',
    position: 'relative',
    overflow: 'hidden',
    background: `linear-gradient(
      90deg,
      rgba(0, 255, 65, 0.05) 0%,
      rgba(0, 255, 65, 0.15) 50%,
      rgba(0, 255, 65, 0.05) 100%
    )`,
    backgroundSize: '200% 100%',
    animation: 'skeleton-matrix 2s ease-in-out infinite, skeleton-scan 3s ease-in-out infinite',
    _before: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(
        90deg,
        transparent 0%,
        rgba(0, 255, 65, 0.3) 50%,
        transparent 100%
      )`,
      animation: 'skeleton-pulse 1.5s ease-in-out infinite',
    },
    _after: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: `linear-gradient(
        90deg,
        transparent,
        rgba(0, 255, 65, 0.8),
        transparent
      )`,
      animation: 'skeleton-scan 2s ease-in-out infinite',
      boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
    },
  },
  variants: {
    variant: {
      default: {},
      matrix: {
        bg: 'rgba(0, 255, 65, 0.05)',
        border: '1px solid',
        borderColor: 'rgba(0, 255, 65, 0.2)',
        boxShadow: '0 0 15px rgba(0, 255, 65, 0.1)',
        animation:
          'skeleton-matrix 2s ease-in-out infinite, skeleton-glitch 4s ease-in-out infinite',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
