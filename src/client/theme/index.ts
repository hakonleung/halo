import { createSystem, defineConfig, defaultConfig } from '@chakra-ui/react';

import { badge } from './components/badge';
import { bottomNav } from './components/bottom-nav';
import { button } from './components/button';
import { card } from './components/card';
import { drawer } from './components/drawer';
import { field } from './components/field';
import { fieldLabel } from './components/field-label';
import { input } from './components/input';
import { menu } from './components/menu';
import { popover } from './components/popover';
import { select } from './components/select';
import { skeleton } from './components/skeleton';
import { switch_ } from './components/switch';
import { tabs } from './components/tabs';
import { keyframes } from './tokens/animations';
import { colors, alphaColors } from './tokens/colors';
import { fonts } from './tokens/fonts';
import { glass, glow } from './tokens/glassmorphism';

export const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        ...colors,
        ...alphaColors,
      },
      fonts,
      shadows: glow,
    },
    semanticTokens: {
      colors: {
        glass,
        primary: { value: '{colors.brand.matrix}' },
        secondary: { value: '{colors.brand.alert}' },
        accent: { value: '{colors.brand.cyber}' },
      },
    },
    keyframes,
    recipes: {
      input,
      button,
      fieldLabel,
      badge,
      skeleton,
    },
    slotRecipes: {
      select,
      field,
      drawer,
      bottomNav,
      popover,
      card,
      tabs,
      switch: switch_,
      menu,
    },
  },
});

export const system = createSystem(defaultConfig, config);
