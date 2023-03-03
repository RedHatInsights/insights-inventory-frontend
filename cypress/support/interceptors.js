/* eslint-disable camelcase */
import { DEFAULT_ROW_COUNT } from '@redhat-cloud-services/frontend-components-utilities';
import fixtures from '../fixtures/groups.json';
import groupsSecondPage from '../fixtures/groupsSecondPage.json';
import groupDetailFixtures from '../fixtures/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C.json';

export const groupsInterceptors = {
    'successful with some items': () =>
        cy
        .intercept('GET', '/api/inventory/v1/groups*', {
            statusCode: 200,
            body: fixtures
        })
        .as('getGroups'),
    'successful with some items second page': () =>
        cy
        .intercept('GET', '/api/inventory/v1/groups?*page=2&perPage=50*', {
            statusCode: 200,
            body: groupsSecondPage
        })
        .as('getGroupsSecond'),
    'successful empty': () =>
        cy
        .intercept('GET', '/api/inventory/v1/groups*', {
            statusCode: 200,
            body: {
                count: 0,
                page: 1,
                per_page: DEFAULT_ROW_COUNT,
                total: 0
            }
        })
        .as('getGroups'),
    'failed with server error': () => {
        Cypress.on('uncaught:exception', () => {
            return false;
        });
        cy.intercept('GET', '/api/inventory/v1/groups*', { statusCode: 500 }).as(
            'getGroups'
        );
    },
    'long responding': () => {
        cy.intercept('GET', '/api/inventory/v1/groups*', {
            statusCode: 200,
            body: fixtures,
            delay: 42000000 // milliseconds
        }).as('getGroups');
    }
};

export const groupDetailInterceptors = {
    successful: () =>
        cy
        .intercept(
            'GET',
            '/api/inventory/v1/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C',
            {
                statusCode: 200,
                body: groupDetailFixtures
            }
        )
        .as('getGroupDetail'),
    empty: () =>
        cy
        .intercept(
            'GET',
            '/api/inventory/v1/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C',
            { statusCode: 404 }
        )
        .as('getGroupDetail'),
    'failed with server error': () => {
        Cypress.on('uncaught:exception', () => {
            return false;
        });
        cy.intercept(
            'GET',
            '/api/inventory/v1/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C',
            { statusCode: 500 }
        ).as('getGroupDetail');
    },
    'long responding': () => {
        cy.intercept(
            'GET',
            '/api/inventory/v1/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C',
            {
                statusCode: 200,
                body: groupDetailFixtures,
                delay: 42000000 // milliseconds
            }
        ).as('getGroupDetail');
    }
};

export const deleteGroupsInterceptors = {
    'successful deletion': () => {
        cy.intercept('DELETE', '/api/inventory/v1/groups/*', {
            statusCode: 204
        }).as('deleteGroups');
    },
    'failed deletion (invalid request)': () => {
        cy.intercept('DELETE', '/api/inventory/v1/groups/*', {
            statusCode: 400
        }).as('deleteGroups');
    }
};
