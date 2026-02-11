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
      borderColor: 'matrix/20',
      borderRadius: 'md',
      boxShadow: 'subtle',
      color: 'text.neon',
      p: 2,
      minWidth: '200px',
    },
    item: {
      borderRadius: 'md',
      color: 'text.neon',
      cursor: 'pointer',
      px: 3,
      py: 2,
      fontSize: 'sm',
      fontFamily: 'mono',
      transition: 'all 150ms',
      _hover: {
        bg: 'matrix/10',
        color: 'brand.matrix',
      },
      _focus: {
        bg: 'matrix/10',
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
      borderColor: 'matrix/20',
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
