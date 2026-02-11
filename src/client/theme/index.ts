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
import { radii, fontSizes } from './tokens/spacing';

export const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        ...colors,
        ...alphaColors,
      },
      fonts,
      shadows: glow,
      radii,
      fontSizes,
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
  globalCss: {
    'html, body': {
      bg: 'bg.deep',
      color: 'text.neon',
      minHeight: '100vh',
    },
    '.neo-switch__control[data-state="checked"]': {
      background: '{colors.brand.matrix} !important',
      borderColor: '{colors.brand.matrix} !important',
      boxShadow: '{shadows.md} !important',
    },
    '.neo-switch__control[data-state="unchecked"]': {
      background: '{colors.bg.dark} !important',
      borderColor: '{colors.bg.dark} !important',
    },
    '.neo-switch__thumb[data-state="checked"]': {
      background: '{colors.bg.deep} !important',
      borderColor: '{colors.brand.matrix} !important',
      boxShadow: '{shadows.thumb} !important',
    },
    '.neo-switch__thumb[data-state="unchecked"]': {
      background: '{colors.bg.carbon} !important',
      borderColor: '{colors.bg.dark} !important',
    },
  },
});

export const system = createSystem(defaultConfig, config);
