/* global require, module, __dirname */

const path = require('path');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const gitRevisionPlugin = new GitRevisionPlugin({
    branch: true
});
const entry = process.env.NODE_ENV === 'production' ?
    path.resolve(__dirname, '../src/entry.js') :
    path.resolve(__dirname, '../src/entry-dev.js');

const gitBranch = process.env.TRAVIS_BRANCH || process.env.BRANCH || gitRevisionPlugin.branch();
const betaBranhces = ['master', 'qa-beta', 'ci-beta', 'prod-beta'];
const appDeployment = (process.env.NODE_ENV === 'production' && betaBranhces.includes(gitBranch)) ?
    'beta/apps' :
    'apps';

/* eslint-disable no-console */
console.log('~~~Using variables~~~');
console.log(`Current branch: ${gitBranch}`);
console.log(`Beta branches: ${betaBranhces}`);
console.log(`Using deployments: ${appDeployment}`);
console.log(`Public path: /${appDeployment}/inventory/`);
console.log('~~~~~~~~~~~~~~~~~~~~~');
/* eslint-enable no-console */

module.exports = {
    paths: {
        entry,
        public: path.resolve(__dirname, '../dist'),
        src: path.resolve(__dirname, '../src'),
        presentationalComponents: path.resolve(__dirname, '../src/PresentationalComponents'),
        smartComponents: path.resolve(__dirname, '../src/SmartComponents'),
        pages: path.resolve(__dirname, '../src/pages'),
        static: path.resolve(__dirname, '../static'),
        publicPath: `/${appDeployment}/inventory/`
    },
    appDeployment
};
