import { defineSlotRecipe } from '@chakra-ui/react';
import { fieldAnatomy } from '@chakra-ui/react/anatomy';

export const field = defineSlotRecipe({
  className: 'neo-field',
  slots: fieldAnatomy.keys(),
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      color: 'text.mist',
      fontFamily: 'mono',
      fontSize: 'sm',
      fontWeight: 'normal',
    },
    errorText: {
      color: 'semantic.error',
      fontFamily: 'mono',
      fontSize: 'xs',
      mt: '4px',
    },
    helperText: {
      color: 'text.mist',
      fontFamily: 'mono',
      fontSize: 'xs',
      mt: '4px',
    },
  },
});
