import { defineRecipe } from '@chakra-ui/react';

export const skeleton = defineRecipe({
  className: 'neo-skeleton',
  base: {
    bg: 'bg.carbon',
    borderRadius: 'md',
    position: 'relative',
    overflow: 'hidden',
    background: `linear-gradient(
      90deg,
      {colors.matrix/5} 0%,
      {colors.matrix/15} 50%,
      {colors.matrix/5} 100%
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
        {colors.matrix/30} 50%,
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
        {colors.matrix/80},
        transparent
      )`,
      animation: 'skeleton-scan 2s ease-in-out infinite',
      boxShadow: '0 0 10px {colors.matrix/50}',
    },
  },
  variants: {
    variant: {
      default: {},
      matrix: {
        bg: 'matrix/5',
        border: '1px solid',
        borderColor: 'matrix/20',
        boxShadow: 'subtle',
        animation:
          'skeleton-matrix 2s ease-in-out infinite, skeleton-glitch 4s ease-in-out infinite',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
