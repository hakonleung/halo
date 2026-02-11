import { defineSlotRecipe } from '@chakra-ui/react';

export const bottomNav = defineSlotRecipe({
  className: 'neo-bottom-nav',
  slots: ['root', 'item', 'icon', 'label'],
  base: {
    root: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: 'transparent',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid',
      borderColor: 'matrix/20',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 200,
    },
    item: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      color: 'text.mist',
      cursor: 'pointer',
      transition: 'color 150ms',
      py: '8px',
      px: '12px',
      _hover: {
        color: 'text.neon',
      },
      _active: {
        color: 'brand.matrix',
      },
    },
    icon: {
      fontSize: '24px',
      transition: 'filter 150ms',
      _groupActive: {
        filter: 'drop-shadow(0 0 4px {colors.brand.matrix})',
      },
    },
    label: {
      fontSize: '10px',
      fontFamily: 'body',
      fontWeight: '500',
    },
  },
});
