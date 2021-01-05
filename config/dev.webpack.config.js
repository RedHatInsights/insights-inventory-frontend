/* global module, __dirname */
const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    https: true,
    debug: true
});

plugins.push(
    require('@redhat-cloud-services/frontend-components-config/federated-modules')({
        root: resolve(__dirname, '../')
    })
);

webpackConfig.resolve.alias = {
    ...webpackConfig.resolve.alias,
    '@react-pdf/renderer': resolve(__dirname, './customPDF')
};

module.exports = {
    ...webpackConfig,
    plugins
};
