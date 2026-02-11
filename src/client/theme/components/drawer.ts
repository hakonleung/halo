import { defineSlotRecipe } from '@chakra-ui/react';
import { drawerAnatomy } from '@chakra-ui/react/anatomy';

export const drawer = defineSlotRecipe({
  className: 'neo-drawer',
  slots: drawerAnatomy.keys(),
  base: {
    backdrop: {
      background: 'transparent',
      backdropFilter: 'blur(4px)',
      zIndex: 400,
    },
    positioner: {
      height: '100vh',
      top: 0,
      right: 0,
      zIndex: 500,
    },
    content: {
      background: 'transparent',
      backdropFilter: 'blur(16px)',
      color: 'text.neon',
      borderLeft: '1px solid',
      borderColor: 'matrix/20',
      boxShadow: 'drawer',
      height: '100%',
    },
    header: {
      borderBottom: '1px solid',
      borderColor: 'matrix/20',
      py: 6,
      px: 6,
    },
    title: {
      color: 'brand.matrix',
      fontFamily: 'heading',
      fontSize: 'md',
      fontWeight: '600',
      textShadow: '0 0 8px currentColor',
    },
    body: {
      py: 6,
      px: 6,
      flex: 1,
      overflowY: 'auto',
    },
    footer: {
      borderTop: '1px solid',
      borderColor: 'matrix/20',
      py: 4,
      px: 6,
    },
    closeTrigger: {
      position: 'absolute',
      color: 'text.mist',
      transition: 'color 150ms',
      _hover: {
        color: 'brand.matrix',
      },
      top: 4,
      right: 4,
    },
  },
  variants: {
    size: {
      sm: {
        content: {
          maxWidth: '280px',
        },
      },
      md: {
        content: {
          maxWidth: '320px',
        },
      },
      lg: {
        content: {
          maxWidth: '480px',
        },
      },
      full: {
        content: {
          maxWidth: '100%',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
