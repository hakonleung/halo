import { defineSlotRecipe } from '@chakra-ui/react';

export const tabs = defineSlotRecipe({
  className: 'neo-tabs',
  slots: ['root', 'list', 'trigger', 'content', 'indicator'],
  base: {
    root: {
      position: 'relative',
    },
    list: {
      display: 'inline-flex',
      position: 'relative',
      isolation: 'isolate',
      borderBottom: '1px solid',
      borderColor: 'rgba(0, 255, 65, 0.2)',
      gap: 2,
    },
    trigger: {
      outline: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '500',
      position: 'relative',
      cursor: 'pointer',
      fontFamily: 'mono',
      fontSize: 'sm',
      color: 'text.mist',
      paddingX: 4,
      paddingY: 2,
      borderBottom: '2px solid',
      borderColor: 'transparent',
      transition: 'all 150ms ease-out',
      _hover: {
        color: 'brand.matrix',
      },
      _focusVisible: {
        outline: '2px solid',
        outlineColor: 'brand.matrix',
        outlineOffset: '2px',
      },
      _disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    content: {
      width: '100%',
      paddingTop: 4,
    },
    indicator: {
      position: 'absolute',
      bottom: 0,
      height: '2px',
      background: 'brand.matrix',
      boxShadow: '0 0 8px rgba(0, 255, 65, 0.5)',
      transition: 'all 200ms ease-out',
      zIndex: 1,
    },
  },
  variants: {
    variant: {
      line: {
        list: {
          borderBottom: '1px solid',
          borderColor: 'rgba(0, 255, 65, 0.2)',
        },
        trigger: {
          borderBottom: '2px solid',
          borderColor: 'transparent',
          _selected: {
            color: 'brand.matrix',
            borderColor: 'brand.matrix',
            textShadow: '0 0 5px currentColor',
          },
        },
        indicator: {
          display: 'none',
        },
      },
      enclosed: {
        list: {
          border: '1px solid',
          borderColor: 'rgba(0, 255, 65, 0.2)',
          borderRadius: '4px',
          padding: 1,
          background: 'rgba(0, 255, 65, 0.02)',
        },
        trigger: {
          borderRadius: '4px',
          _selected: {
            color: 'brand.matrix',
            background: 'rgba(0, 255, 65, 0.1)',
            boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)',
            textShadow: '0 0 5px currentColor',
          },
        },
        indicator: {
          display: 'none',
        },
      },
    },
    size: {
      sm: {
        trigger: {
          fontSize: '12px',
          paddingX: 3,
          paddingY: 1.5,
        },
      },
      md: {
        trigger: {
          fontSize: '14px',
          paddingX: 4,
          paddingY: 2,
        },
      },
      lg: {
        trigger: {
          fontSize: '16px',
          paddingX: 5,
          paddingY: 2.5,
        },
      },
    },
  },
  defaultVariants: {
    variant: 'line',
    size: 'md',
  },
});
