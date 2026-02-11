import { defineRecipe } from '@chakra-ui/react';

export const badge = defineRecipe({
  className: 'neo-badge',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'body',
    fontSize: 'xs',
    fontWeight: '500',
    px: '4px',
    py: '1px',
    borderRadius: 'sm',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  variants: {
    colorScheme: {
      success: {
        background: 'matrix/20',
        borderColor: 'brand.matrix',
        color: 'brand.matrix',
      },
      warning: {
        background: 'warning/20',
        borderColor: 'semantic.warning',
        color: 'semantic.warning',
      },
      error: {
        background: 'error/20',
        borderColor: 'semantic.error',
        color: 'semantic.error',
      },
      info: {
        background: 'info/20',
        borderColor: 'semantic.info',
        color: 'semantic.info',
      },
      neutral: {
        background: 'mist/20',
        borderColor: 'text.mist',
        color: 'text.mist',
      },
    },
    size: {
      sm: {
        fontSize: 'xs',
        px: '4px',
        py: '1px',
      },
      md: {
        fontSize: 'xs',
        px: '4px',
        py: '1px',
      },
      lg: {
        fontSize: 'xs',
        px: '4px',
        py: '1px',
      },
    },
  },
  defaultVariants: {
    colorScheme: 'success',
    size: 'md',
  },
});
