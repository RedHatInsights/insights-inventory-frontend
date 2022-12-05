const { defineConfig } = require('cypress');
const webpackConfig = require('./config/cypress.webpack.config.js');

module.exports = defineConfig({
    viewportWidth: 1000,
    viewportHeight: 660,
    video: false,
    component: {
        devServer: {
            framework: 'react',
            bundler: 'webpack',
            webpackConfig
        },
        specPattern: 'src/**/*.cy.{js,ts,jsx,tsx}'
    }
});
