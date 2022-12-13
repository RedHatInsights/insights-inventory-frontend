/* global module, __dirname */
require.extensions['.css'] = () => undefined;
const path = require('path');
const glob = require('glob');

const mapper = {
    TextVariants: 'Text',
    DropdownPosition: 'dropdownConstants',
    EmptyStateVariant: 'EmptyState',
    TextListItemVariants: 'TextListItem',
    TextListVariants: 'TextList',
    getDefaultOUIAId: 'ouia',
    useOUIAProps: 'ouia',
    PaginationVariant: 'Pagination'
};

const FECMapper = {
    SkeletonSize: 'Skeleton',
    PageHeaderTitle: 'PageHeader'
};

const NotificationMapper = {
    REMOVE_NOTIFICATION: 'actionTypes',
    ADD_NOTIFICATION: 'actionTypes',
    NotificationsPortal: 'NotificationPortal/index',
    addNotification: 'actions'
};

const IconMapper = {
    AnsibeTowerIcon: 'ansibeTower-icon',
    ChartSpikeIcon: 'chartSpike-icon'
};

module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: '> 0.25%, not dead'
            }
        ],
        '@babel/react'
    ],
    plugins: [
        [
            '@babel/plugin-proposal-decorators',
            {
                legacy: true
            }
        ],
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-runtime',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-object-rest-spread',
        [
            'transform-imports',
            {
                '@redhat-cloud-services/frontend-components-notifications': {
                    transform: (importName) =>
                        `@redhat-cloud-services/frontend-components-notifications/${
                            NotificationMapper[importName] || importName
                        }.js`,
                    preventFullImport: true
                },
                '@redhat-cloud-services/frontend-components': {
                    transform: (importName) =>
                        `@redhat-cloud-services/frontend-components/${FECMapper[importName] || importName}`,
                    preventFullImport: true,
                    skipDefaultConversion: true
                },
                '@patternfly/react-icons': {
                    transform: (importName) =>
                        `@patternfly/react-icons/dist/esm/icons/${IconMapper[importName] || importName
                        .split(/(?=[A-Z])/)
                        .join('-')
                        .toLowerCase()}.js`,
                    preventFullImport: true
                },
                '@patternfly/react-core': {
                    transform: (importName) => {
                        const files = glob.sync(
                            path.resolve(
                                __dirname,
                                `./node_modules/@patternfly/react-core/dist/esm/**/${mapper[
                                importName
                                ] || importName}.js`
                            )
                        );
                        if (files.length > 0) {
                            return files[0].replace(/.*(?=@patternfly)/, '');
                        } else {
                            throw `File with importName ${importName} does not exist`;
                        }
                    },
                    preventFullImport: false,
                    skipDefaultConversion: true
                }
            },
            'frontend-notifications'
        ]
    ],
    env: {
        componentTest: {
            plugins: [
                'istanbul'
            ]
        }
    }
};
