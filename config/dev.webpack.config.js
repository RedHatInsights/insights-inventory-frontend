/* global module, __dirname */
const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    debug: true,
    ...(process.env.BETA && { deployment: 'beta/apps' }), // necessary for proper dev server xhr calls routing (fed-mods.json)
    port: 8003 // required only locally when running more that one webpack dev server
});

plugins.push(
    require('@redhat-cloud-services/frontend-components-config/federated-modules')({
        root: resolve(__dirname, '../'),
        useFileHash: false,
        exposes: {
            // The application entry file. This is done automatically if the exposes key is not defined
            './RootApp': resolve(__dirname, '../src/AppEntry'),
            // Shared component module path. Must include default export!
            './SampleSharedComponent': resolve(__dirname, '../src/shared-components/SampleSharedComponent.js')
        }
    })
);

webpackConfig.resolve.alias = {
    ...webpackConfig.resolve.alias,
    '@react-pdf/renderer': resolve(__dirname, './customPDF'),
    reactRedux: resolve(__dirname, '../node_modules/react-redux')
};

module.exports = {
    ...webpackConfig,
    plugins
};
