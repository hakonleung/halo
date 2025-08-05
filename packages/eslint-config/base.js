import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import onlyWarn from 'eslint-plugin-only-warn';
import turboPlugin from 'eslint-plugin-turbo';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
      // 限制每个文件最多250行
      'max-lines': [
        'error',
        {
          max: 250,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      // Import排序规则
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js内置模块
            'external', // 外部依赖
            'internal', // 内部模块
            'parent', // 父级目录
            'sibling', // 同级目录
            'index', // index文件
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      // 移除未使用的import
      'unused-imports/no-unused-imports': 'error',
      // 替换默认的no-unused-vars规则，与unused-imports配合使用
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ['dist/**'],
  },
];
