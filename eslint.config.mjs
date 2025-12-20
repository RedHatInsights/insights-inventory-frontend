import fecPlugin from '@redhat-cloud-services/eslint-config-redhat-cloud-services';
import tsParser from '@typescript-eslint/parser';
import pluginCypress from 'eslint-plugin-cypress/flat';
import jestDom from 'eslint-plugin-jest-dom';
import jsdoc from 'eslint-plugin-jsdoc';
import playwright from 'eslint-plugin-playwright';
import reactHooks from 'eslint-plugin-react-hooks';
import testingLibrary from 'eslint-plugin-testing-library';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const flatPlugins = [
  fecPlugin,
  pluginCypress.configs.recommended,
  jsdoc.configs['flat/recommended'],
];

const TEST_FILES = [
  'src/**/*.test.{js,jsx,ts,tsx}',
  'src/**/__tests__/**/*.{js,jsx,ts,tsx}',
];

export default defineConfig([
  globalIgnores(['node_modules/*', 'static/*', 'dist/*', 'docs/*']),
  ...flatPlugins,
  {
    linterOptions: {
			reportUnusedDisableDirectives: "error",
		},
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      // Add other TypeScript-specific rules here
    },
  },
  {
    files: TEST_FILES,
    ...jestDom.configs['flat/recommended'],
  },
  {
    files: TEST_FILES,
    ...testingLibrary.configs['flat/react'],
  },
  {
    files: ['src/**/*.{js,jsx,ts,tsx}', 'src/**/*.{js,jsx,ts,tsx}'],
    ...reactHooks.configs['recommended-latest'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['_playwright-tests/**/*.test.ts', '_playwright-tests/helpers/**'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/prefer-web-first-assertions': 'off',
    },
  },
  {
    rules: {
      'rulesdir/disallow-fec-relative-imports': 'off',
      'rulesdir/forbid-pf-relative-imports': 'off',
      'jsdoc/tag-lines': 0,
      'jsdoc/require-jsdoc': 0,
      'jsdoc/check-line-alignment': [
        'error',
        'always',
        {
          customSpacings: {
            postDelimiter: 2,
          },
        },
      ],
      'jsdoc/check-tag-names': [
        'warn',
        {
          definedTags: ['category', 'subcategory'],
        },
      ],
      // Add other non-TypeScript specific rules here
    },
  },
]);
