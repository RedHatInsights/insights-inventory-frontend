/* eslint-disable camelcase */
import { mount } from '@cypress/react';
import {
    changePagination,
    checkEmptyState,
    checkPaginationTotal,
    checkPaginationValues,
    checkTableHeaders,
    CHIP,
    CHIP_GROUP,
    hasChip,
    PAGINATION_VALUES,
    SORTING_ORDERS,
    TEXT_INPUT,
    TOOLBAR,
    TOOLBAR_FILTER
} from '@redhat-cloud-services/frontend-components-utilities';
import _ from 'lodash';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import fixtures from '../../../cypress/fixtures/groups.json';
import { getStore } from '../../store';
import GroupsTable from './GroupsTable';

const ORDER_TO_URL = {
    ascending: 'ASC',
    descending: 'DESC'
};

const DEFAULT_ROW_COUNT = 50;
const TABLE_HEADERS = ['Name', 'Total systems', 'Last modified'];
const ROOT = 'div[id="groups-table"]';

const interceptors = {
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
    'failed with server error': () =>
    {
        Cypress.on('uncaught:exception', (err, runnable) => {
            return false;
        });
        cy
        .intercept('GET', '/api/inventory/v1/groups*', { statusCode: 500 })
        .as('getGroups');
    }
};

const mountTable = () =>
    mount(
        <Provider store={getStore()}>
            <MemoryRouter>
                <GroupsTable />
            </MemoryRouter>
        </Provider>
    );

before(() => {
    cy.window().then(
        (window) =>
            (window.insights = {
                chrome: {
                    isProd: false,
                    auth: {
                        getUser: () => {
                            return Promise.resolve({});
                        }
                    }
                }
            })
    );
});

describe('renders correctly', () => {
    beforeEach(() => {
        interceptors['successful with some items']();
        mountTable();
    });

    it('the root container is rendered', () => {
        cy.get(ROOT).should('have.length', 1);
    });

    it('renders toolbar', () => {
        cy.get(TOOLBAR).should('have.length', 1);
    });

    it('renders table header', () => {
        checkTableHeaders(TABLE_HEADERS);
    });
});

describe('defaults', () => {
    beforeEach(() => {
        interceptors['successful with some items']();
        mountTable();
    });

    it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
        cy.wait('@getGroups');
        cy.get('.pf-c-options-menu__toggle-text')
        .find('b')
        .eq(0)
        .should('have.text', `1 - ${DEFAULT_ROW_COUNT}`);
    });

    it('name filter is a default filter', () => {
        cy.get(TOOLBAR_FILTER).find(TEXT_INPUT).should('exist');
    });
});

describe('pagination', () => {
    beforeEach(() => {
        interceptors['successful with some items']();
        mountTable();
    });

    it('shows correct total number of groups', () => {
        checkPaginationTotal(fixtures.total);
    });

    it('values are expected ones', () => {
        checkPaginationValues(PAGINATION_VALUES);
    });

    it('can change page limit', () => {
        cy.wait('@getGroups').then(() => {
            // first initial call
            cy.wrap(PAGINATION_VALUES).each((el) => {
                changePagination(el).then(() => {
                    cy.wait('@getGroups')
                    .its('request.url')
                    .should('include', `perPage=${el}`);
                });
            });
        });
    });
});

describe('sorting', () => {
    beforeEach(() => {
        interceptors['successful with some items']();
        mountTable();
    });

    const checkSorting = (label, order, dataField) => {
    // get appropriate locators
        const header = `th[data-label="${label}"]`;
        if (order === 'ascending') {
            cy.get(header).find('button').click();
        } else {
            cy.get(header).find('button').click().click();
        }

        cy.wait('@getGroups')
        .its('request.url')
        .should('include', `order_how=${ORDER_TO_URL[order]}`)
        .and('include', `order_by=${dataField}`);
    };

    _.zip(['name', 'host_ids', 'updated_at'], TABLE_HEADERS).forEach(
        ([category, label]) => {
            SORTING_ORDERS.forEach((order) => {
                it(`${order} by ${label}`, () => {
                    checkSorting(label, order, category);
                });
            });
        }
    );
});

describe('filtering', () => {
    beforeEach(() => {
        interceptors['successful with some items']();
        mountTable();
    });

    const applyNameFilter = () => {
        cy.get('.ins-c-primary-toolbar__filter').find('input').type('lorem');
    };

    it('renders filter chip', () => {
        applyNameFilter();
        hasChip('Name', 'lorem');
    });

    it('sends correct request', () => {
        applyNameFilter();
        cy.wait('@getGroups')
        .its('request.url')
        .should('include', 'hostname_or_id=lorem');
    });

    it('can remove the chip or reset filters', () => {
        applyNameFilter();
        cy.get(CHIP_GROUP)
        .find(CHIP)
        .ouiaId('close', 'button')
        .each(() => {
            cy.get(CHIP_GROUP).find(CHIP).ouiaId('close', 'button');
        });
        cy.get('button').contains('Reset filters').click();
        cy.get(CHIP_GROUP).should('not.exist');
    });
});

describe('edge cases', () => {
    it('no groups match', () => {
        interceptors['successful empty']();
        mountTable();

        cy.wait('@getGroups').then(() => {
            checkEmptyState('No matching systems found');
            checkPaginationTotal(0);
        });
    });

    it('failed request', () => {
        interceptors['failed with server error']();
        mountTable();

        cy.wait('@getGroups').then(() => {
            cy.get('.pf-c-empty-state').find('h4').contains('Something went wrong');
            // the filter is disabled
            cy.ouiaId('ConditionalFilter').should('have.attr', 'disabled');
            cy.ouiaId('pager').find('button').should('have.attr', 'disabled');
        });
    });
});
