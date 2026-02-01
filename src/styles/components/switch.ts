import { defineSlotRecipe } from '@chakra-ui/react';

export const switchRecipe = defineSlotRecipe({
  className: 'neo-switch',
  slots: ['root', 'track', 'thumb', 'label'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    track: {
      position: 'relative',
      borderRadius: '9999px',
      transition: 'all 200ms ease-out',
      cursor: 'pointer',
      bg: 'bg.dark',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'bg.dark',
      _checked: {
        bg: 'brand.matrix',
        borderColor: 'brand.matrix',
        boxShadow: '0 0 10px rgba(0, 255, 65, 0.3), 0 0 20px rgba(0, 255, 65, 0.1)',
      },
      _hover: {
        borderColor: 'brand.matrix',
      },
      _disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    thumb: {
      position: 'absolute',
      borderRadius: '50%',
      transition: 'all 200ms ease-out',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      bg: 'bg.carbon',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'bg.dark',
      _checked: {
        bg: 'bg.deep',
        borderColor: 'brand.matrix',
        boxShadow: '0 0 8px rgba(0, 255, 65, 0.5)',
      },
    },
    label: {
      fontFamily: 'body',
      fontSize: '14px',
      color: 'text.neon',
      cursor: 'pointer',
      userSelect: 'none',
    },
  },
  variants: {
    size: {
      sm: {
        track: {
          width: '36px',
          height: '20px',
        },
        thumb: {
          width: '16px',
          height: '16px',
          left: '2px',
          _checked: {
            left: 'calc(100% - 18px)',
          },
        },
        label: {
          fontSize: '12px',
        },
      },
      md: {
        track: {
          width: '44px',
          height: '24px',
        },
        thumb: {
          width: '20px',
          height: '20px',
          left: '2px',
          _checked: {
            left: 'calc(100% - 22px)',
          },
        },
        label: {
          fontSize: '14px',
        },
      },
      lg: {
        track: {
          width: '52px',
          height: '28px',
        },
        thumb: {
          width: '24px',
          height: '24px',
          left: '2px',
          _checked: {
            left: 'calc(100% - 26px)',
          },
        },
        label: {
          fontSize: '16px',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
