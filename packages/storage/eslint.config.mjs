import { config as baseConfig } from '@repo/eslint-config/base';

export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['dist/**', 'node_modules/**', 'drizzle/**', 'src/db/postgres/pgdata/**'],
  },
]; 