/* global module, __dirname */
require.extensions['.css'] = () => undefined;
const path = require('path');
const glob = require('glob');

const mapper = {
    TextVariants: 'Text',
    DropdownPosition: 'dropdownConstants',
    EmptyStateVariant: 'EmptyState',
    TextListItemVariants: 'TextListItem',
    TextListVariants: 'TextList'
};

const FECMapper = {
    SkeletonSize: 'Skeleton',
    PageHeaderTitle: 'PageHeader'
};

const NotificationMapper = {
    REMOVE_NOTIFICATION: 'actionTypes',
    ADD_NOTIFICATION: 'actionTypes',
    NotificationsPortal: 'NotificationPortal',
    addNotification: 'actions'
};

const IconMapper = {
    AnsibeTowerIcon: 'ansibeTower-icon'
};

module.exports = {
    presets: [
        [
            '@babel/env',
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
        'lodash',
        [
            'transform-imports',
            {
                '@patternfly/react-core': {
                    transform: (importName) => {
                        const files = glob.sync(
                            path.resolve(
                                __dirname,
                                `./node_modules/@patternfly/react-core/dist/js/**/${mapper[
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
            'react-core'
        ],
        [
            'transform-imports',
            {
                '@patternfly/react-icons': {
                    transform: (importName) =>
                        `@patternfly/react-icons/dist/js/icons/${IconMapper[importName] || importName
                        .split(/(?=[A-Z])/)
                        .join('-')
                        .toLowerCase()}.js`,
                    preventFullImport: true
                }
            },
            'react-icons'
        ],
        [
            'transform-imports',
            {
                '@redhat-cloud-services/frontend-components': {
                    transform: (importName) =>
                        `@redhat-cloud-services/frontend-components/components/cjs/${FECMapper[importName] || importName}.js`,
                    preventFullImport: false,
                    skipDefaultConversion: true
                }
            },
            'frontend-components'
        ],
        [
            'transform-imports',
            {
                '@redhat-cloud-services/frontend-components-notifications': {
                    transform: (importName) =>
                        `@redhat-cloud-services/frontend-components-notifications/cjs/${NotificationMapper[importName] || importName}.js`,
                    preventFullImport: true
                }
            },
            'frontend-notifications'
        ]
    ],
    ignore: ['node_modules']
};
