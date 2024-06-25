module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.25%, not dead',
      },
    ],
    '@babel/react',
  ],
  plugins: [
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-object-rest-spread',
  ],
  env: {
    componentTest: {
      plugins: ['istanbul'],
    },
  },
};
