module.exports = {
  extends: [
    '@redhat-cloud-services/eslint-config-redhat-cloud-services',
    'plugin:cypress/recommended',
    'plugin:testing-library/react',
    'plugin:jest-dom/recommended',
  ],
  globals: {
    IS_DEV: 'readonly',
  },
};
