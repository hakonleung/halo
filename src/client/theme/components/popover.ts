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
      borderColor: 'matrix/20',
      borderRadius: 'md',
      boxShadow: 'sm',
      color: 'text.neon',
      zIndex: 300,
    },
    header: {
      fontFamily: 'heading',
      fontSize: 'sm',
      fontWeight: '600',
      color: 'brand.matrix',
      borderBottom: '1px solid',
      borderColor: 'matrix/20',
      px: '12px',
      py: '8px',
    },
    body: {
      px: '12px',
      py: '12px',
    },
    footer: {
      borderTop: '1px solid',
      borderColor: 'matrix/20',
      px: '12px',
      py: '8px',
    },
    arrow: {
      '--popper-arrow-bg': '{colors.glass.bg}',
      '--popper-arrow-shadow-color': '{colors.matrix/20}',
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
