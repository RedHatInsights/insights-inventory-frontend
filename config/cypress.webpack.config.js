/* global module, __dirname */
const { resolve } = require('path');
const webpack = require('webpack');
const config = require('@redhat-cloud-services/frontend-components-config');

const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../')
});

plugins.push(new webpack.DefinePlugin({
    IS_DEV: true
}));

module.exports = {
    ...webpackConfig,
    plugins
};
