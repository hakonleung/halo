import { defineSlotRecipe } from '@chakra-ui/react';
import { popoverAnatomy } from '@chakra-ui/react/anatomy';

export const popover = defineSlotRecipe({
  className: 'neo-popover',
  slots: popoverAnatomy.keys(),
  base: {
    content: {
      background: 'transparent',
      backdropFilter: 'blur(16px)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgba(0, 255, 65, 0.2)',
      borderRadius: '4px',
      boxShadow: '0 0 5px rgba(0, 255, 65, 0.3)',
      color: 'text.neon',
      zIndex: 300,
    },
    header: {
      fontFamily: 'heading',
      fontSize: '14px',
      fontWeight: '600',
      color: 'brand.matrix',
      borderBottom: '1px solid',
      borderColor: 'rgba(0, 255, 65, 0.2)',
      px: '12px',
      py: '8px',
    },
    body: {
      px: '12px',
      py: '12px',
    },
    footer: {
      borderTop: '1px solid',
      borderColor: 'rgba(0, 255, 65, 0.2)',
      px: '12px',
      py: '8px',
    },
    arrow: {
      '--popper-arrow-bg': 'rgba(26, 26, 26, 0.8)',
      '--popper-arrow-shadow-color': 'rgba(0, 255, 65, 0.2)',
    },
    closeTrigger: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      color: 'text.mist',
      _hover: {
        color: 'brand.matrix',
      },
    },
  },
});
