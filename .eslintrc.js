module.exports = {
  parser: '@babel/eslint-parser',
  extends: [
    '@redhat-cloud-services/eslint-config-redhat-cloud-services',
    'plugin:cypress/recommended',
    'plugin:testing-library/react',
    'plugin:jest-dom/recommended',
    'plugin:react-hooks/recommended',
  ],
  globals: {
    IS_DEV: 'readonly',
    React: true,
  },
  rules: {
    'rulesdir/forbid-pf-relative-imports': 'off',
  },
};
