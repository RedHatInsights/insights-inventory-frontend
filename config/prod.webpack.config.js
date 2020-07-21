/* global module, __dirname */
const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    debug: true
});

webpackConfig.resolve.alias = {
    customReact: 'react'
};

module.exports = {
    ...webpackConfig,
    plugins
};
