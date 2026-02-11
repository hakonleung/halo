import { defineSlotRecipe } from '@chakra-ui/react';
import { selectAnatomy } from '@chakra-ui/react/anatomy';

export const select = defineSlotRecipe({
  className: 'neo-select',
  slots: selectAnatomy.keys(),
  base: {
    root: {
      width: '100%',
    },
    trigger: {
      fontFamily: 'body',
      fontSize: 'sm',
      background: 'bg.deep',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'bg.dark',
      borderRadius: 'md',
      color: 'text.neon',
      transition: 'all 200ms ease-out',
      _focus: {
        borderColor: 'brand.matrix',
        boxShadow: 'md',
        outline: 'none',
      },
    },
    valueText: {
      _placeholder: {
        color: 'text.dim',
      },
    },
    positioner: {
      background: 'transparent',
      zIndex: 300,
    },
    content: {
      background: 'transparent',
      backdropFilter: 'blur(16px)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'matrix/20',
      borderRadius: 'md',
      boxShadow: 'md',
      py: '4px',
      overflow: 'hidden',
    },
    item: {
      fontFamily: 'body',
      fontSize: 'sm',
      color: 'text.neon',
      px: '16px',
      py: '10px',
      cursor: 'pointer',
      transition: 'background 150ms',
      _hover: {
        background: 'matrix/10',
      },
      _highlighted: {
        background: 'matrix/10',
      },
      _selected: {
        background: 'matrix/20',
        borderLeft: '2px solid',
        borderColor: 'brand.matrix',
      },
      _disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    itemText: {
      flex: 1,
    },
    itemIndicator: {
      color: 'brand.matrix',
    },
    indicator: {
      color: 'text.mist',
    },
  },
  variants: {
    size: {
      sm: {
        trigger: {
          height: '32px',
          minHeight: '32px',
          px: '12px',
          py: '0',
          fontSize: 'xs',
        },
      },
      md: {
        trigger: {
          height: '40px',
          minHeight: '40px',
          px: '16px',
          py: '0',
          fontSize: 'sm',
        },
      },
      lg: {
        trigger: {
          height: '48px',
          minHeight: '48px',
          px: '16px',
          py: '0',
          fontSize: 'md',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
