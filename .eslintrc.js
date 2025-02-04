module.exports = {
  parser: '@babel/eslint-parser',
  plugins: ['jsdoc'],
  extends: [
    '@redhat-cloud-services/eslint-config-redhat-cloud-services',
    'plugin:cypress/recommended',
    'plugin:testing-library/react',
    'plugin:jest-dom/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsdoc/recommended',
  ],
  rules: {
    'rulesdir/forbid-pf-relative-imports': 'off',
  },
};
