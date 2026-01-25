import { defineRecipe } from '@chakra-ui/react';

export const button = defineRecipe({
  base: {
    fontFamily: 'mono',
  },
  variants: {
    variant: {
      primary: {
        bg: 'brand.matrix',
        color: 'bg.deep',
        _hover: {
          bg: 'brand.matrix',
          opacity: 0.8,
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
        _hover: {
          bg: 'brand.matrix',
          opacity: 0.8,
        },
      },
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});
