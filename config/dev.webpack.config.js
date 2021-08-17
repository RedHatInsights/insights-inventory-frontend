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
        useCloud: true,
        proxyVerbose: true,
        appUrl: process.env.BETA ? '/beta/insights/inventory' : '/insights/inventory',
        ...process.env.LOCAL_API && {
            routes: {
                ...(process.env.LOCAL_API.split(',') || []).reduce((acc, curr) => {
                    const [appName, appConfig] = (curr || '').split(':');
                    const [appPort = 8003, protocol = 'http'] = appConfig.split('~');
                    return {
                        ...acc,
                        [`/apps/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
                        [`/insights/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
                        [`/beta/insights/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
                        [`/beta/apps/${appName}`]: { host: `${protocol}://localhost:${appPort}` }
                    };
                }, {})
            }
        }
    }
});

plugins.push(
    require('@redhat-cloud-services/frontend-components-config/federated-modules')({
        root: resolve(__dirname, '../'),
        useFileHash: false,
        exposes: {
            './RootApp': resolve(__dirname, '../src/AppEntry'),
            './SystemDetail': resolve(__dirname, '../src/components/SystemDetails/GeneralInfo.js'),
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
    IS_DEV: true
}));

webpackConfig.resolve.alias = {
    ...webpackConfig.resolve.alias,
    '@react-pdf/renderer': resolve(__dirname, './customPDF'),
    'html-webpack-plugin': resolve(__dirname, '../node_modules/html-webpack-plugin'),
    reactRedux: resolve(__dirname, '../node_modules/react-redux')
};

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
