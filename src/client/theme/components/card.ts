import { defineSlotRecipe } from '@chakra-ui/react';
import { cardAnatomy } from '@chakra-ui/react/anatomy';

export const card = defineSlotRecipe({
  className: 'neo-card',
  slots: cardAnatomy.keys(),
  base: {
    root: {
      background: 'transparent',
      backdropFilter: 'blur(16px)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'matrix/20',
      borderRadius: 'lg',
      boxShadow: 'sm',
      transition: 'all 150ms ease-out',
      _hover: {
        boxShadow: 'md',
        borderColor: 'matrix/40',
      },
    },
    header: {},
    body: {},
    footer: {},
    title: {},
    description: {},
  },
  variants: {
    variant: {
      default: {},
      decorated: {
        root: {
          position: 'relative',
          _before: {
            content: '""',
            position: 'absolute',
            top: '-1px',
            left: '-1px',
            width: '12px',
            height: '12px',
            borderTop: '2px solid {colors.matrix/50}',
            borderLeft: '2px solid {colors.matrix/50}',
            pointerEvents: 'none',
          },
          _after: {
            content: '""',
            position: 'absolute',
            bottom: '-1px',
            right: '-1px',
            width: '12px',
            height: '12px',
            borderBottom: '2px solid {colors.matrix/50}',
            borderRight: '2px solid {colors.matrix/50}',
            pointerEvents: 'none',
          },
        },
      },
      scanline: {
        root: {
          position: 'relative',
          overflow: 'hidden',
          _after: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              {colors.matrix/3} 2px,
              {colors.matrix/3} 4px
            )`,
            pointerEvents: 'none',
            animation: 'scan-line 4s linear infinite',
          },
        },
      },
      solid: {
        root: {
          background: 'bg.carbon',
          backdropFilter: 'none',
        },
      },
    },
    size: {
      sm: {
        root: {
          p: '0',
        },
        body: {
          p: '4px',
        },
      },
      md: {
        root: {
          p: '24px',
        },
        body: {
          p: '24px',
        },
      },
      lg: {
        root: {
          p: '32px',
        },
        body: {
          p: '32px',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});
