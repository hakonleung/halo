import { defineSlotRecipe } from '@chakra-ui/react';

export const select = defineSlotRecipe({
  className: 'neo-select',
  slots: [
    'root',
    'trigger',
    'positioner',
    'content',
    'item',
    'itemText',
    'itemIndicator',
    'indicator',
  ],
  base: {
    root: {
      width: '100%',
    },
    trigger: {
      fontFamily: 'body',
      fontSize: '14px',
      background: 'bg.deep',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'bg.dark',
      borderRadius: '4px',
      color: 'text.neon',
      transition: 'all 200ms ease-out',
      _focus: {
        borderColor: 'brand.matrix',
        boxShadow: '0 0 10px rgba(0, 255, 65, 0.3), 0 0 20px rgba(0, 255, 65, 0.1)',
        outline: 'none',
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
      borderColor: 'rgba(0, 255, 65, 0.2)',
      borderRadius: '4px',
      boxShadow: '0 0 10px rgba(0, 255, 65, 0.3), 0 0 20px rgba(0, 255, 65, 0.1)',
      py: '4px',
      overflow: 'hidden',
    },
    item: {
      fontFamily: 'body',
      fontSize: '14px',
      color: 'text.neon',
      px: '16px',
      py: '10px',
      cursor: 'pointer',
      transition: 'background 150ms',
      _hover: {
        background: 'rgba(0, 255, 65, 0.1)',
      },
      _highlighted: {
        background: 'rgba(0, 255, 65, 0.1)',
      },
      _selected: {
        background: 'rgba(0, 255, 65, 0.2)',
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
          px: '12px',
          fontSize: '12px',
        },
      },
      md: {
        trigger: {
          height: '40px',
          px: '16px',
          fontSize: '14px',
        },
      },
      lg: {
        trigger: {
          height: '48px',
          px: '16px',
          fontSize: '16px',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
