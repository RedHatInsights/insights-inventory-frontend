/* eslint-disable max-len */
/* global module, __dirname */
const { resolve } = require('path');
const webpack = require('webpack');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
    rootFolder: resolve(__dirname, '../'),
    debug: true
});

plugins.push(
    require('@redhat-cloud-services/frontend-components-config/federated-modules')({
        root: resolve(__dirname, '../'),
        exposes: {
            // Application root
            './RootApp': resolve(__dirname, '../src/AppEntry'),
            // System detail
            './SystemDetail': resolve(__dirname, '../src/components/SystemDetails/GeneralInfo.js'),
            // System detail cards
            './SystemCard': resolve(__dirname, '../src/components/GeneralInfo/SystemCard/SystemCard.js'),
            './OperatingSystemCard':
              resolve(__dirname, '../src/components/GeneralInfo/OperatingSystemCard/OperatingSystemCard.js'),
            './InfrastructureCard': resolve(__dirname, '../src/components/GeneralInfo/InfrastructureCard/InfrastructureCard.js'),
            './ConfigurationCard': resolve(__dirname, '../src/components/GeneralInfo/ConfigurationCard/ConfigurationCard.js'),
            './CollectionCard': resolve(__dirname, '../src/components/GeneralInfo/CollectionCard/CollectionCard.js'),
            './BiosCard': resolve(__dirname, '../src/components/GeneralInfo/BiosCard/BiosCard.js'),
            // System detail data providers
            './selectors': resolve(__dirname, '../src/components/GeneralInfo/selectors/index.js'),
            './dataMapper': resolve(__dirname, '../src/components/GeneralInfo/dataMapper/index.js'),
            // Inventory modules
            './InventoryTable': resolve(__dirname, '../src/modules/InventoryTable.js'),
            './AppInfo': resolve(__dirname, '../src/modules/AppInfo.js'),
            './InventoryDetailHead': resolve(__dirname, '../src/modules/InventoryDetailHead.js'),
            './InventoryDetail': resolve(__dirname, '../src/modules/InventoryDetail.js'),
            './TagWithDialog': resolve(__dirname, '../src/modules/TagWithDialog.js'),
            './DetailWrapper': resolve(__dirname, '../src/modules/DetailWrapper.js')
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

webpackConfig.module.rules = [
    ...webpackConfig.module.rules,
    {
        test: /\.m?js/,
        resolve: {
            fullySpecified: false
        }
    }
];

module.exports = {
    ...webpackConfig,
    plugins
};
