import { defineRecipe } from '@chakra-ui/react';

export const input = defineRecipe({
  className: 'neo-input',
  base: {
    fontFamily: 'body',
    fontSize: 'sm',
    borderRadius: 'md',
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
          boxShadow: 'md',
          outline: 'none',
        },
        _invalid: {
          borderColor: 'semantic.error',
          boxShadow: 'error',
        },
      },
      solid: {
        background: 'bg.carbon',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'bg.dark',
        _focus: {
          borderColor: 'brand.matrix',
          boxShadow: 'md',
          outline: 'none',
        },
        _invalid: {
          borderColor: 'semantic.error',
          boxShadow: 'errorSm',
        },
      },
      subtle: {
        background: 'transparent',
        borderWidth: '0',
        _focus: {
          boxShadow: 'sm',
          outline: 'none',
        },
      },
    },
    size: {
      sm: {
        height: '32px',
        px: '12px',
        fontSize: 'xs',
      },
      md: {
        height: '40px',
        px: '16px',
        fontSize: 'sm',
      },
      lg: {
        height: '48px',
        px: '16px',
        fontSize: 'md',
      },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
});
