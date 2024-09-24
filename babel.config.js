module.exports = {
  env: {
    componentTest: {
      plugins: ['istanbul'],
    },
  },
  presets: [
    [
      '@babel/env',
      {
        targets: '> 0.25%, not dead',
      },
    ],
    '@babel/react',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
  ],
};
