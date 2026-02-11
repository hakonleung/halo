import { defineRecipe } from '@chakra-ui/react';

export const button = defineRecipe({
  className: 'neo-button',
  base: {
    fontFamily: 'body',
    fontWeight: '600',
    borderRadius: 'md',
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
  },
  variants: {
    variant: {
      primary: {
        background: 'linear-gradient(135deg, {colors.brand.matrix}, {colors.brand.matrixDark})',
        color: 'bg.deep',
        _hover: {
          boxShadow: 'lg',
          animation: 'pulse-glow 2s ease-in-out infinite',
        },
        _active: {
          animation: 'glitch 150ms ease-in-out',
        },
      },
      secondary: {
        background: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'brand.matrix',
        color: 'brand.matrix',
        boxShadow: 'sm',
        _hover: {
          background: 'matrix/10',
          boxShadow: 'md',
        },
      },
      danger: {
        background: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'semantic.error',
        color: 'semantic.error',
        boxShadow: '0 0 5px {colors.error/30}',
        _hover: {
          background: 'error/10',
          boxShadow: 'error',
        },
      },
      ghost: {
        background: 'transparent',
        color: 'text.neon',
        _hover: {
          background: 'white/5',
        },
      },
      toggle: {
        bg: 'bg.dark',
        color: 'text.mist',
        _hover: {
          opacity: 0.8,
        },
      },
      'toggle-active': {
        bg: 'brand.matrix',
        color: 'bg.deep',
        boxShadow: '0 0 10px {colors.matrix/30}',
        _hover: {
          opacity: 0.9,
        },
      },
    },
    size: {
      sm: {
        height: '32px',
        px: '16px',
        fontSize: 'xs',
      },
      md: {
        height: '40px',
        px: '20px',
        fontSize: 'sm',
      },
      lg: {
        height: '48px',
        px: '24px',
        fontSize: 'md',
      },
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});
