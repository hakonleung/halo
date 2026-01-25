import { createSystem, defineConfig, defaultConfig } from '@chakra-ui/react';
import { input } from './components/input';
import { button } from './components/button';
import { select } from './components/select';
import { fieldLabel } from './components/field-label';

export const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          matrix: { value: '#00FF41' },
          alert: { value: '#FF6B35' },
          cyber: { value: '#00D4FF' },
        },
        bg: {
          deep: { value: '#0A0A0A' },
          carbon: { value: '#1A1A1A' },
          dark: { value: '#2A2A2A' },
        },
        text: {
          neon: { value: '#E0E0E0' },
          mist: { value: '#888888' },
          dim: { value: '#555555' },
        },
      },
      fonts: {
        heading: { value: 'monospace, "Press Start 2P"' },
        body: { value: 'monospace, "VT323", "IBM Plex Mono"' },
      },
    },
    semanticTokens: {
      colors: {
        primary: { value: '{colors.brand.matrix}' },
        secondary: { value: '{colors.brand.alert}' },
        accent: { value: '{colors.brand.cyber}' },
      },
    },
    keyframes: {
      glitch: {
        '0%': { transform: 'translate(0)' },
        '20%': { transform: 'translate(-2px, 2px)' },
        '40%': { transform: 'translate(-2px, -2px)' },
        '60%': { transform: 'translate(2px, 2px)' },
        '80%': { transform: 'translate(2px, -2px)' },
        '100%': { transform: 'translate(0)' },
      },
      'matrix-flow': {
        '0%': { backgroundPosition: '0% 0%' },
        '100%': { backgroundPosition: '0% 100%' },
      },
    },
    recipes: {
      input,
      button,
      select,
      fieldLabel,
    },
  },
} as const);

export const system = createSystem(defaultConfig, config);
