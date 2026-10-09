module.exports = {
  '*.{js,jsx,ts,tsx}': 'eslint --fix',
  '*.scss': 'stylelint --config .stylelint.json',
  '{package.json,package-lock.json}': () => 'npm run lint',
};
