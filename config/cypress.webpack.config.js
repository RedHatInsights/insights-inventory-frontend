/* global module, __dirname */
const { resolve } = require('path');
const webpack = require('webpack');
const config = require('@redhat-cloud-services/frontend-components-config');

const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    ...process.env.MOCK && {
        customProxy: [
            {
                context: ['/api/inventory/v1/groups'], // you can adjust the `context` value to redirect only specific endpoints
                target: 'http://localhost:4010', // default prism port
                secure: false,
                changeOrigin: true,
                pathRewrite: { '^/api/inventory/v1': '' },
                onProxyReq: (proxyReq) => {
                    proxyReq.setHeader('x-rh-identity', 'foobar'); // avoid 401 errors by providing neccessary security header
                }
            }
        ]
    }
});

plugins.push(new webpack.DefinePlugin({
    IS_DEV: true
}));

module.exports = {
    ...webpackConfig,
    plugins
};
