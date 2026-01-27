import { defineSlotRecipe } from '@chakra-ui/react';

export const drawer = defineSlotRecipe({
  slots: ['backdrop', 'positioner', 'content', 'header', 'title', 'body', 'footer', 'closeTrigger'],
  base: {
    backdrop: {
      bg: 'blackAlpha.600',
      backdropFilter: 'blur(4px)',
    },
    positioner: {
      height: '100vh',
      top: 0,
      right: 0,
    },
    content: {
      bg: 'bg.carbon',
      color: 'text.neon',
      borderLeft: '1px solid',
      borderColor: 'brand.matrix',
      boxShadow: '0 0 15px rgba(0, 255, 65, 0.1)',
      height: '100%',
    },
    header: {
      borderBottom: '1px solid',
      borderColor: 'rgba(0, 255, 65, 0.2)',
      py: 6,
    },
    title: {
      color: 'brand.matrix',
      fontFamily: 'heading',
      textShadow: '0 0 8px currentColor',
    },
    body: {
      py: 8,
    },
    closeTrigger: {
      color: 'text.mist',
      _hover: {
        color: 'brand.matrix',
      },
      top: 4,
      right: 4,
    },
  },
});
