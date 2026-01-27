import { defineSlotRecipe } from '@chakra-ui/react';

export const select = defineSlotRecipe({
  slots: ['trigger', 'positioner', 'content', 'item'],
  base: {
    trigger: {
      borderColor: 'brand.matrix',
      bg: 'bg.carbon',
      color: 'text.neon',
      fontFamily: 'mono',
    },
  },
});
