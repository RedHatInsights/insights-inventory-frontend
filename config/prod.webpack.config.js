/* eslint-disable max-len */
/* global module, __dirname */
const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    debug: true
});

plugins.push(
    require('@redhat-cloud-services/frontend-components-config/federated-modules')({
        root: resolve(__dirname, '../'),
        exposes: {
            './RootApp': resolve(__dirname, '../src/AppEntry'),
            './SystemDetail': resolve(__dirname, '../src/components/inventory/GeneralInfo')
        }
    })
);

plugins.push(new webpack.DefinePlugin({
    IS_DEV: false
}));

webpackConfig.resolve.alias = {
    ...webpackConfig.resolve.alias,
    'html-webpack-plugin': resolve(__dirname, '../node_modules/html-webpack-plugin'),
    '@react-pdf/renderer': resolve(__dirname, './customPDF')
};

webpackConfig.optimization.concatenateModules = false;

module.exports = {
    ...webpackConfig,
    plugins
};
