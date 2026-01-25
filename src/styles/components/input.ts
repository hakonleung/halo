import { defineSlotRecipe } from '@chakra-ui/react';

export const input = defineSlotRecipe({
  slots: ['field'],
  base: {
    field: {
      borderColor: 'brand.matrix',
      bg: 'bg.carbon',
      color: 'text.neon',
      fontFamily: 'mono',
      _focus: {
        borderColor: 'brand.matrix',
        boxShadow: '0 0 0 1px var(--chakra-colors-brand-matrix)',
      },
      _invalid: {
        borderColor: 'red.500',
      },
    },
  },
});
