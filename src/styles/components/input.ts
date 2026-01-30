import { defineRecipe } from '@chakra-ui/react';

export const input = defineRecipe({
  className: 'neo-input',
  base: {
    fontFamily: 'body',
    fontSize: '14px',
    borderRadius: '4px',
    color: 'text.neon',
    transition: 'all 200ms ease-out',
    width: '100%',
    _placeholder: {
      color: 'text.dim',
      opacity: 1,
    },
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      outline: {
        background: 'bg.deep',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'bg.dark',
        _focus: {
          borderColor: 'brand.matrix',
          boxShadow: '0 0 10px rgba(0, 255, 65, 0.3), 0 0 20px rgba(0, 255, 65, 0.1)',
          outline: 'none',
        },
        _invalid: {
          borderColor: 'semantic.error',
          boxShadow: '0 0 10px rgba(255, 51, 102, 0.3), 0 0 20px rgba(255, 51, 102, 0.1)',
        },
      },
      solid: {
        background: 'bg.carbon',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'bg.dark',
        _focus: {
          borderColor: 'brand.matrix',
          boxShadow: '0 0 10px rgba(0, 255, 65, 0.3), 0 0 20px rgba(0, 255, 65, 0.1)',
          outline: 'none',
        },
        _invalid: {
          borderColor: 'semantic.error',
          boxShadow: '0 0 10px rgba(255, 51, 102, 0.3)',
        },
      },
      subtle: {
        background: 'transparent',
        borderWidth: '0',
        _focus: {
          boxShadow: '0 0 5px rgba(0, 255, 65, 0.3)',
          outline: 'none',
        },
      },
    },
    size: {
      sm: {
        height: '32px',
        px: '12px',
        fontSize: '12px',
      },
      md: {
        height: '40px',
        px: '16px',
        fontSize: '14px',
      },
      lg: {
        height: '48px',
        px: '16px',
        fontSize: '16px',
      },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
});
