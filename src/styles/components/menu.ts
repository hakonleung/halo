import { defineSlotRecipe } from '@chakra-ui/react';
import { menuAnatomy } from '@chakra-ui/react/anatomy';

export const menu = defineSlotRecipe({
  className: 'neo-menu',
  slots: menuAnatomy.keys(),
  base: {
    positioner: {
      zIndex: 600,
    },
    content: {
      background: 'transparent',
      backdropFilter: 'blur(16px)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgba(0, 255, 65, 0.2)',
      borderRadius: '4px',
      boxShadow: '0 0 15px rgba(0, 255, 65, 0.1)',
      color: 'text.neon',
      p: 2,
      minWidth: '200px',
    },
    item: {
      borderRadius: '4px',
      color: 'text.neon',
      cursor: 'pointer',
      px: 3,
      py: 2,
      fontSize: 'sm',
      fontFamily: 'mono',
      transition: 'all 150ms',
      _hover: {
        bg: 'rgba(0, 255, 65, 0.1)',
        color: 'brand.matrix',
      },
      _focus: {
        bg: 'rgba(0, 255, 65, 0.1)',
        color: 'brand.matrix',
      },
      _disabled: {
        color: 'text.dim',
        cursor: 'not-allowed',
        opacity: 0.5,
      },
    },
    itemText: {
      flex: 1,
    },
    separator: {
      borderColor: 'rgba(0, 255, 65, 0.2)',
      my: 2,
    },
    itemGroupLabel: {
      color: 'text.mist',
      fontSize: 'xs',
      fontFamily: 'heading',
      fontWeight: '600',
      px: 3,
      py: 1,
      textTransform: 'uppercase',
    },
  },
  variants: {
    size: {
      sm: {
        content: {
          maxW: '200px',
        },
      },
      md: {
        content: {
          maxW: '280px',
        },
      },
      lg: {
        content: {
          maxW: '360px',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
