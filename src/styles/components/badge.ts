import { defineRecipe } from '@chakra-ui/react';

export const badge = defineRecipe({
  className: 'neo-badge',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'body',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    px: '8px',
    py: '2px',
    borderRadius: '4px',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  variants: {
    colorScheme: {
      success: {
        background: 'rgba(0, 255, 65, 0.2)',
        borderColor: 'brand.matrix',
        color: 'brand.matrix',
      },
      warning: {
        background: 'rgba(255, 215, 0, 0.2)',
        borderColor: 'semantic.warning',
        color: 'semantic.warning',
      },
      error: {
        background: 'rgba(255, 51, 102, 0.2)',
        borderColor: 'semantic.error',
        color: 'semantic.error',
      },
      info: {
        background: 'rgba(0, 212, 255, 0.2)',
        borderColor: 'semantic.info',
        color: 'semantic.info',
      },
      neutral: {
        background: 'rgba(136, 136, 136, 0.2)',
        borderColor: 'text.mist',
        color: 'text.mist',
      },
    },
    size: {
      sm: {
        fontSize: '9px',
        px: '6px',
        py: '1px',
      },
      md: {
        fontSize: '10px',
        px: '8px',
        py: '2px',
      },
      lg: {
        fontSize: '11px',
        px: '10px',
        py: '3px',
      },
    },
  },
  defaultVariants: {
    colorScheme: 'success',
    size: 'md',
  },
});
