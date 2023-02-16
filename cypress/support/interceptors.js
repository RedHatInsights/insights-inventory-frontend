/* eslint-disable camelcase */
import { DEFAULT_ROW_COUNT } from '@redhat-cloud-services/frontend-components-utilities';
import fixtures from '../fixtures/groups.json';

export const groupsInterceptors = {
    'successful with some items': () =>
        cy.intercept('GET', '/api/inventory/v1/groups*', fixtures).as('getGroups'),
    'successful empty': () =>
        cy
        .intercept('GET', '/api/inventory/v1/groups*', {
            count: 0,
            page: 1,
            per_page: DEFAULT_ROW_COUNT,
            total: 0
        })
        .as('getGroups'),
    'failed with server error': () => {
        Cypress.on('uncaught:exception', (err, runnable) => {
            return false;
        });
        cy.intercept('GET', '/api/inventory/v1/groups*', { statusCode: 500 }).as(
            'getGroups'
        );
    },
    'long responding': () => {
        cy.intercept('GET', '/api/inventory/v1/groups*', (req) => {
            req.reply({
                body: fixtures,
                delay: 42000000 // milliseconds
            });
        }).as('getGroups');
    }
};
