module.exports = {
  '*.scss': 'stylelint --config .stylelint.json',
  '{package.json,package-lock.json}': () => 'npm run lint',
};
