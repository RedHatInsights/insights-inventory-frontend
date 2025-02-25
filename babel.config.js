module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: '> 0.25%, not dead',
      },
    ],
    '@babel/react',
  ],
  plugins: ['@babel/plugin-transform-runtime'],
  env: {
    componentTest: {
      plugins: ['istanbul'],
    },
  },
};
