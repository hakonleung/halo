import { defineSlotRecipe } from '@chakra-ui/react';

export const card = defineSlotRecipe({
  className: 'neo-card',
  slots: ['root', 'header', 'body', 'footer', 'title', 'description'],
  base: {
    root: {
      background: 'transparent',
      backdropFilter: 'blur(16px)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgba(0, 255, 65, 0.2)',
      borderRadius: '8px',
      boxShadow: '0 0 5px rgba(0, 255, 65, 0.3)',
      transition: 'all 150ms ease-out',
      _hover: {
        boxShadow: '0 0 10px rgba(0, 255, 65, 0.3), 0 0 20px rgba(0, 255, 65, 0.1)',
        borderColor: 'rgba(0, 255, 65, 0.4)',
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
            borderTop: '2px solid rgba(0, 255, 65, 0.5)',
            borderLeft: '2px solid rgba(0, 255, 65, 0.5)',
            pointerEvents: 'none',
          },
          _after: {
            content: '""',
            position: 'absolute',
            bottom: '-1px',
            right: '-1px',
            width: '12px',
            height: '12px',
            borderBottom: '2px solid rgba(0, 255, 65, 0.5)',
            borderRight: '2px solid rgba(0, 255, 65, 0.5)',
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
              rgba(0, 255, 65, 0.03) 2px,
              rgba(0, 255, 65, 0.03) 4px
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
