const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  ...(process.env.MOCK && {
    customProxy: [
      {
        context: ['/api/inventory/v1/groups'], // you can adjust the `context` value to redirect only specific endpoints
        target: 'http://localhost:4010', // default prism port
        secure: false,
        changeOrigin: true,
        pathRewrite: { '^/api/inventory/v1': '' },
        onProxyReq: (proxyReq) => {
          proxyReq.setHeader('x-rh-identity', 'foobar'); // avoid 401 errors by providing neccessary security header
        },
      },
    ],
  }),
});

module.exports = {
  ...webpackConfig,
  plugins,
  module: {
    ...webpackConfig.module,
    rules: [
      ...webpackConfig.module.rules,
      {
        resolve: {
          alias: {
            '@redhat-cloud-services/frontend-components/useChrome': resolve(
              __dirname,
              './overrideChrome.js'
            ),
            '../useChrome': resolve(__dirname, './overrideChrome.js'),
          },
        },
      },
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /(node_modules|bower_components)/i,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
      zlib: require.resolve('browserify-zlib'),
    },
  },
};
