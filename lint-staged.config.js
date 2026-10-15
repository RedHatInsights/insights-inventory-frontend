module.exports = {
  '*.{js,jsx,ts,tsx,mjs,cjs}': 'eslint',
  '*.scss': 'stylelint --config .stylelint.json',
  '{package.json,package-lock.json}': () => 'npm run lint',
};
