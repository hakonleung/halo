import { defineRecipe } from '@chakra-ui/react';

export const input = defineRecipe({
  base: {
    borderColor: 'brand.matrix',
    bg: 'bg.carbon',
    color: 'text.neon',
    fontFamily: 'mono',
    _placeholder: {
      color: 'text.mist',
      opacity: 1,
    },
    _focus: {
      borderColor: 'brand.matrix',
      boxShadow: '0 0 0 1px var(--chakra-colors-brand-matrix)',
    },
    _invalid: {
      borderColor: 'red.500',
    },
  },
  variants: {
    variant: {
      outline: {
        borderWidth: '1px',
        borderStyle: 'solid',
      },
      solid: {
        borderWidth: '1px',
        borderStyle: 'solid',
      },
      subtle: {
        borderWidth: '0',
        bg: 'transparent',
      },
    },
  },
  defaultVariants: {
    variant: 'outline',
  },
});
