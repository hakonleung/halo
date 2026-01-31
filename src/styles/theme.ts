import { createSystem, defineConfig, defaultConfig } from '@chakra-ui/react';
import { colors, alphaColors } from './tokens/colors';
import { fonts } from './tokens/fonts';
import { keyframes } from './tokens/animations';
import { glass, glow } from './tokens/glassmorphism';
import { input } from './components/input';
import { button } from './components/button';
import { select } from './components/select';
import { fieldLabel } from './components/field-label';
import { drawer } from './components/drawer';
import { card } from './components/card';
import { badge } from './components/badge';
import { bottomNav } from './components/bottom-nav';
import { popover } from './components/popover';
import { tabs } from './components/tabs';

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
    },
    slotRecipes: {
      select,
      drawer,
      bottomNav,
      popover,
      card,
      tabs,
    },
  },
});

export const system = createSystem(defaultConfig, config);
