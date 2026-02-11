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
      background: 'bg.dark',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'bg.dark',
      borderRadius: 'full',
      '&[data-state="unchecked"]': {
        background: 'bg.dark',
        borderColor: 'bg.dark',
      },
      '&[data-state="checked"]': {
        background: 'brand.matrix',
        borderColor: 'brand.matrix',
        boxShadow: 'md',
      },
      _checked: {
        background: 'brand.matrix',
        borderColor: 'brand.matrix',
        boxShadow: 'md',
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
      boxShadow: 'drop',
      background: 'bg.carbon',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'bg.dark',
      borderRadius: 'full',
      '&[data-state="unchecked"]': {
        background: 'bg.carbon',
        borderColor: 'bg.dark',
      },
      '&[data-state="checked"]': {
        background: 'bg.deep',
        borderColor: 'brand.matrix',
        boxShadow: 'thumb',
      },
      _checked: {
        background: 'bg.deep',
        borderColor: 'brand.matrix',
        boxShadow: 'thumb',
      },
    },
    label: {
      fontFamily: 'mono',
      fontSize: 'sm',
      color: 'text.mist',
      cursor: 'pointer',
      userSelect: 'none',
    },
  },
  variants: {
    variant: {
      solid: {
        control: {
          '&[data-state="unchecked"]': {
            background: 'bg.dark',
          },
          '&[data-state="checked"]': {
            background: 'brand.matrix',
            borderColor: 'brand.matrix',
            boxShadow: 'md',
          },
        },
        thumb: {
          '&[data-state="checked"]': {
            background: 'bg.deep',
            borderColor: 'brand.matrix',
          },
        },
      },
      raised: {
        control: {
          '&[data-state="unchecked"]': {
            background: 'bg.dark',
          },
          '&[data-state="checked"]': {
            background: 'brand.matrix',
            borderColor: 'brand.matrix',
            boxShadow: 'md',
          },
        },
        thumb: {
          '&[data-state="checked"]': {
            background: 'bg.deep',
            borderColor: 'brand.matrix',
          },
        },
      },
    },
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
          fontSize: 'xs',
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
          fontSize: 'sm',
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
          fontSize: 'md',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
