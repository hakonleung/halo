import { config as baseConfig } from '@repo/eslint-config/base';

export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.next/**',
      '.turbo/**',
      'packages/*/dist/**',
      'apps/*/build/**',
      'apps/*/.next/**',
      'packages/storage/drizzle/**',
      'packages/storage/src/db/postgres/pgdata/**',
    ],
  },
]; 