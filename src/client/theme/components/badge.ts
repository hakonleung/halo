import { defineRecipe } from '@chakra-ui/react';

export const badge = defineRecipe({
  className: 'neo-badge',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'body',
    fontSize: '12px',
    fontWeight: '500',
    px: '4px',
    py: '1px',
    borderRadius: '2px',
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
        fontSize: '12px',
        px: '4px',
        py: '1px',
      },
      md: {
        fontSize: '12px',
        px: '4px',
        py: '1px',
      },
      lg: {
        fontSize: '12px',
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
