import { defineSlotRecipe } from '@chakra-ui/react';
import { switchAnatomy } from '@chakra-ui/react/anatomy';

export const switch_ = defineSlotRecipe({
  className: 'neo-switch',
  slots: switchAnatomy.keys(),
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    control: {
      position: 'relative',
      transition: 'all 200ms ease-out',
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
      fontFamily: 'mono',
      fontSize: '14px',
      color: 'text.mist',
      cursor: 'pointer',
      userSelect: 'none',
    },
  },
  variants: {
    size: {
      sm: {
        control: {
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
        control: {
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
        control: {
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
