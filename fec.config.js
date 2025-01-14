const { resolve } = require('path');
const packageJson = require('./package.json');
const webpack = require('webpack');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

const bundle = 'insights';
const appName = packageJson[bundle].appname;

module.exports = {
  appName,
  appUrl: `/${bundle}/${appName}`,
  useProxy: process.env.PROXY === 'true',
  debug: true,
  devtool: 'hidden-source-map',
  plugins: [
    new webpack.DefinePlugin({
      IS_DEV: process.env.NODE_ENV !== 'production',
    }),
    // Put the Sentry Webpack plugin after all other plugins
    ...(process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryWebpackPlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: 'red-hat-it',
            project: 'inventory-rhel',
            moduleMetadata: ({ release }) => ({
              dsn: 'https://f6f21a635c05b0f91875de6a557f8c34@o490301.ingest.us.sentry.io/4507454722211840',
              release,
              org: 'red-hat-it',
              project: 'inventory-rhel',
            }),
          }),
        ]
      : [
          // Justs injects the debug ids
          sentryWebpackPlugin({
            org: 'red-hat-it',
            project: 'inventory-rhel',
            moduleMetadata: ({ release }) => ({
              dsn: 'https://f6f21a635c05b0f91875de6a557f8c34@o490301.ingest.us.sentry.io/4507454722211840',
              release,
              org: 'red-hat-it',
              project: 'inventory-rhel',
            }),
          }),
        ]),
  ],
  moduleFederation: {
    shared: [
      {
        'react-router-dom': {
          singleton: true,
          import: false,
          version: packageJson.dependencies['react-router-dom'],
          requiredVersion: '>=6.0.0 <7.0.0',
        },
      },
    ],
    exposes: {
      // Application root
      './RootApp': resolve(__dirname, '/src/AppEntry'),
      // System detail
      './SystemDetail': resolve(
        __dirname,
        '/src/components/SystemDetails/GeneralInfo.js'
      ),
      // System detail cards
      './GeneralInformation': resolve(
        __dirname,
        '/src/components/GeneralInfo/GeneralInformation/GeneralInformation.js'
      ),
      './SystemCard': resolve(
        __dirname,
        '/src/components/GeneralInfo/SystemCard/SystemCard.js'
      ),
      './OperatingSystemCard': resolve(
        __dirname,
        '/src/components/GeneralInfo/OperatingSystemCard/OperatingSystemCard.js'
      ),
      './InfrastructureCard': resolve(
        __dirname,
        '/src/components/GeneralInfo/InfrastructureCard/InfrastructureCard.js'
      ),
      './ConfigurationCard': resolve(
        __dirname,
        '/src/components/GeneralInfo/ConfigurationCard/ConfigurationCard.js'
      ),
      './CollectionCard': resolve(
        __dirname,
        '/src/components/GeneralInfo/CollectionCard/CollectionCard.js'
      ),
      './BiosCard': resolve(
        __dirname,
        '/src/components/GeneralInfo/BiosCard/BiosCard.js'
      ),
      './DataCollectorsCard': resolve(
        __dirname,
        '/src/components/GeneralInfo/DataCollectorsCard/DataCollectorsCard.js'
      ),
      './LoadingCard': resolve(
        __dirname,
        '/src/components/GeneralInfo/LoadingCard/LoadingCard.js'
      ),
      './TextInputModal': resolve(
        __dirname,
        '/src/components/GeneralInfo/TextInputModal/TextInputModal.js'
      ),
      // System detail data providers
      './selectors': resolve(
        __dirname,
        '/src/components/GeneralInfo/selectors/index.js'
      ),
      './dataMapper': resolve(
        __dirname,
        '/src/components/GeneralInfo/dataMapper/index.js'
      ),
      // Inventory modules
      './InventoryTable': resolve(__dirname, '/src/modules/InventoryTable.js'),
      './AppInfo': resolve(__dirname, '/src/modules/AppInfo.js'),
      './InventoryDetailHead': resolve(
        __dirname,
        '/src/modules/InventoryDetailHead.js'
      ),
      './DetailHeader': resolve(__dirname, '/src/modules/DetailHeader.js'),
      './InventoryDetail': resolve(
        __dirname,
        '/src/modules/InventoryDetail.js'
      ),
      './TagWithDialog': resolve(__dirname, '/src/modules/TagWithDialog.js'),
      './DetailWrapper': resolve(__dirname, '/src/modules/DetailWrapper.js'),
      './OsFilterHelpers': resolve(
        __dirname,
        '/src/modules/OsFilterHelpers.js'
      ),
      './systemProfileStore': resolve(
        __dirname,
        '/src/store/systemProfileStore.js'
      ),
      './DeleteModal': resolve(__dirname, '/src/Utilities/DeleteModal.js'),
      './HybridInventoryTabs': resolve(
        __dirname,
        '/src/modules/HybridInventoryTabs.js'
      ),
      './ImmutableDevices': resolve(
        __dirname,
        '/src/modules/ImmutableDevices.js'
      ),
    },
  },
};
