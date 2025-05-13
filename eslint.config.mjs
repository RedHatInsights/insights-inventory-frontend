import fecPlugin from '@redhat-cloud-services/eslint-config-redhat-cloud-services';
import tsParser from '@typescript-eslint/parser';
import pluginCypress from 'eslint-plugin-cypress/flat';
import jestDom from 'eslint-plugin-jest-dom';
import jsdoc from 'eslint-plugin-jsdoc';
import reactHooks from 'eslint-plugin-react-hooks';
import testingLibrary from 'eslint-plugin-testing-library';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const flatPlugins = [
  fecPlugin,
  pluginCypress.configs.recommended,
  reactHooks.configs['recommended-latest'],
  jsdoc.configs['flat/recommended'],
  tseslint.configs.recommended,
  testingLibrary.configs['flat/react'],
  jestDom.configs['flat/recommended'],
];

export default defineConfig([
  globalIgnores(['node_modules/*', 'static/*', 'dist/*', 'docs/*']),
  ...flatPlugins,
  {
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      'rulesdir/disallow-fec-relative-imports': 'off',
      '@typescript-eslint/no-unused-vars': 1,
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
    },
  },
]);
