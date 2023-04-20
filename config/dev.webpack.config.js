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
        env: `${process.env.ENVIRONMENT || 'stage'}-${
          process.env.BETA ? 'beta' : 'stable'
        }`, // for accessing prod-beta start your app with ENVIRONMENT=prod and BETA=true
        appUrl: process.env.BETA ? ['/beta/insights/inventory', '/preview/insights/inventory'] : '/insights/inventory',
        routes: {
            ...(process.env.CONFIG_PORT && {
                [`${process.env.BETA ? '/beta' : ''}/config`]: {
                    host: `http://localhost:${process.env.CONFIG_PORT}`
                }
            }),
            ...process.env.LOCAL_API && {
                ...(process.env.LOCAL_API.split(',') || []).reduce((acc, curr) => {
                    const [appName, appConfig] = (curr || '').split(':');
                    const [appPort = 8003, protocol = 'http'] = appConfig.split('~');
                    return {
                        ...acc,
                        [`/apps/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
                        // [`/insights/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
                        // [`/beta/insights/${appName}`]: { host: `${protocol}://localhost:${appPort}` },
                        [`/beta/apps/${appName}`]: { host: `${protocol}://localhost:${appPort}` }
                    };
                }, {})
            }
        }
    },
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

plugins.push(
    require('@redhat-cloud-services/frontend-components-config/federated-modules')({
        root: resolve(__dirname, '../'),
        useFileHash: false,
        exposes: {
            // Application root
            './RootApp': resolve(__dirname, '../src/AppEntry'),
            // System detail
            './SystemDetail': resolve(__dirname, '../src/components/SystemDetails/GeneralInfo.js'),
            // System detail cards
            './GeneralInformation': resolve(__dirname, '../src/components/GeneralInfo/GeneralInformation/GeneralInformation.js'),
            './SystemCard': resolve(__dirname, '../src/components/GeneralInfo/SystemCard/SystemCard.js'),
            './OperatingSystemCard':
              resolve(__dirname, '../src/components/GeneralInfo/OperatingSystemCard/OperatingSystemCard.js'),
            './InfrastructureCard': resolve(__dirname, '../src/components/GeneralInfo/InfrastructureCard/InfrastructureCard.js'),
            './ConfigurationCard': resolve(__dirname, '../src/components/GeneralInfo/ConfigurationCard/ConfigurationCard.js'),
            './CollectionCard': resolve(__dirname, '../src/components/GeneralInfo/CollectionCard/CollectionCard.js'),
            './BiosCard': resolve(__dirname, '../src/components/GeneralInfo/BiosCard/BiosCard.js'),
            './DataCollectorsCard': resolve(__dirname, '../src/components/GeneralInfo/DataCollectorsCard/DataCollectorsCard.js'),
            './LoadingCard': resolve(__dirname, '../src/components/GeneralInfo/LoadingCard/LoadingCard.js'),
            // System detail data providers
            './selectors': resolve(__dirname, '../src/components/GeneralInfo/selectors/index.js'),
            './dataMapper': resolve(__dirname, '../src/components/GeneralInfo/dataMapper/index.js'),
            // Inventory modules
            './InventoryTable': resolve(__dirname, '../src/modules/InventoryTable.js'),
            './AppInfo': resolve(__dirname, '../src/modules/AppInfo.js'),
            './InventoryDetailHead': resolve(__dirname, '../src/modules/InventoryDetailHead.js'),
            './DetailHeader': resolve(__dirname, '../src/modules/DetailHeader.js'),
            './InventoryDetail': resolve(__dirname, '../src/modules/InventoryDetail.js'),
            './TagWithDialog': resolve(__dirname, '../src/modules/TagWithDialog.js'),
            './DetailWrapper': resolve(__dirname, '../src/modules/DetailWrapper.js'),
            './OsFilterHelpers': resolve(__dirname, '../src/modules/OsFilterHelpers.js'),
            './systemProfileStore': resolve(__dirname, '../src/store/systemProfileStore.js')
        }
    })
);

plugins.push(new webpack.DefinePlugin({
    IS_DEV: true
}));

webpackConfig.resolve.alias = {
    ...webpackConfig.resolve.alias,
    '@react-pdf/renderer': resolve(__dirname, './customPDF'),
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

webpackConfig.devServer.client.overlay = false;

module.exports = {
    ...webpackConfig,
    plugins
};
