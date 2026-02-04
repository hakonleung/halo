import { defineRecipe } from '@chakra-ui/react';

export const button = defineRecipe({
  className: 'neo-button',
  base: {
    fontFamily: 'body',
    fontWeight: '600',
    borderRadius: '4px',
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
        background: 'linear-gradient(135deg, #00FF41, #00CC33)',
        color: 'bg.deep',
        _hover: {
          boxShadow: '0 0 15px rgba(0, 255, 65, 0.4), 0 0 30px rgba(0, 255, 65, 0.2)',
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
        boxShadow: '0 0 5px rgba(0, 255, 65, 0.3)',
        _hover: {
          background: 'rgba(0, 255, 65, 0.1)',
          boxShadow: '0 0 10px rgba(0, 255, 65, 0.3), 0 0 20px rgba(0, 255, 65, 0.1)',
        },
      },
      danger: {
        background: 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'semantic.error',
        color: 'semantic.error',
        boxShadow: '0 0 5px rgba(255, 51, 102, 0.3)',
        _hover: {
          background: 'rgba(255, 51, 102, 0.1)',
          boxShadow: '0 0 10px rgba(255, 51, 102, 0.3), 0 0 20px rgba(255, 51, 102, 0.1)',
        },
      },
      ghost: {
        background: 'transparent',
        color: 'text.neon',
        _hover: {
          background: 'rgba(255, 255, 255, 0.05)',
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
        boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)',
        _hover: {
          opacity: 0.9,
        },
      },
    },
    size: {
      sm: {
        height: '32px',
        px: '16px',
        fontSize: '12px',
      },
      md: {
        height: '40px',
        px: '20px',
        fontSize: '14px',
      },
      lg: {
        height: '48px',
        px: '24px',
        fontSize: '16px',
      },
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});
