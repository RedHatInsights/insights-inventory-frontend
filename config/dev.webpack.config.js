/* global module, __dirname */
const { resolve } = require('path');
const webpack = require('webpack');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    debug: true,
    ...(process.env.BETA && { deployment: 'beta/apps' }),
    ...process.env.PROXY && {
        https: true,
        useProxy: true,
        proxyVerbose: true,
        appUrl: process.env.BETA ? '/beta/insights/inventory' : '/insights/inventory'
    }
});

plugins.push(
    require('@redhat-cloud-services/frontend-components-config/federated-modules')({
        root: resolve(__dirname, '../'),
        useFileHash: false,
        exposes: {
            './RootApp': resolve(__dirname, '../src/AppEntry'),
            './SystemDetail': resolve(__dirname, '../src/components/inventory/GeneralInfo')
        }
    })
);

plugins.push(new webpack.DefinePlugin({
    IS_DEV: true
}));

webpackConfig.resolve.alias = {
    ...webpackConfig.resolve.alias,
    '@react-pdf/renderer': resolve(__dirname, './customPDF'),
    'html-webpack-plugin': resolve(__dirname, '../node_modules/html-webpack-plugin'),
    reactRedux: resolve(__dirname, '../node_modules/react-redux')
};

module.exports = {
    ...webpackConfig,
    plugins
};
