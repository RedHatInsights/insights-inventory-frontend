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
    ROW,
    SORTING_ORDERS,
    TEXT_INPUT,
    TOOLBAR,
    TOOLBAR_FILTER,
    DROPDOWN_TOGGLE,
    DROPDOWN,
    DROPDOWN_ITEM,
    MODAL
} from '@redhat-cloud-services/frontend-components-utilities';
import _ from 'lodash';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import fixtures from '../../../cypress/fixtures/groups.json';
import { groupsInterceptors as interceptors } from '../../../cypress/support/interceptors';
import { checkSelectedNumber, ORDER_TO_URL, selectRowN } from '../../../cypress/support/utils';
import { getStore } from '../../store';
import GroupsTable from './GroupsTable';

const DEFAULT_ROW_COUNT = 50;
const TABLE_HEADERS = ['Name', 'Total systems', 'Last modified'];
const ROOT = 'div[id="groups-table"]';

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
        interceptors['successful with some items'](); // comment out if the mock server is running
        mountTable();

        cy.wait('@getGroups'); // first initial call
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

        cy.wait('@getGroups'); // first initial call
    });

    it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
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

        cy.wait('@getGroups'); // first initial call
    });

    it('shows correct total number of groups', () => {
        checkPaginationTotal(fixtures.total);
    });

    it('values are expected ones', () => {
        checkPaginationValues(PAGINATION_VALUES);
    });

    it('can change page limit', () => {
        PAGINATION_VALUES.forEach((el) => {
            changePagination(el).then(() => {
                cy.wait('@getGroups')
                .its('request.url')
                .should('include', `per_page=${el}`);
            });
        });
    });

    it('can change page', () => {
        cy.get('button[data-action=next]').eq(0).click(); // click "next page" button
        cy.wait('@getGroups').its('request.url').should('include', `page=2`);
    });
});

describe('sorting', () => {
    beforeEach(() => {
        interceptors['successful with some items']();
        mountTable();

        cy.wait('@getGroups'); // first initial request
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

        cy.wait('@getGroups'); // first initial request
    });

    const applyNameFilter = () =>
        cy.get('.ins-c-primary-toolbar__filter').find('input').type('lorem');
    ;

    it('renders filter chip', () => {
        applyNameFilter();
        hasChip('Name', 'lorem');
        cy.wait('@getGroups');
    });

    it('sends correct request', () => {
        applyNameFilter();
        cy.wait('@getGroups').its('request.url').should('include', 'name=lorem');
    });

    it('can remove the chip or reset filters', () => {
        applyNameFilter();
        cy.wait('@getGroups').its('request.url').should('contain', 'name=lorem');
        cy.get(CHIP_GROUP)
        .find(CHIP)
        .ouiaId('close', 'button')
        .each(() => {
            cy.get(CHIP_GROUP).find(CHIP).ouiaId('close', 'button');
        });
        cy.get('button').contains('Reset filters').click();
        cy.wait('@getGroups').its('request.url').should('not.contain', 'name');
        cy.get(CHIP_GROUP).should('not.exist');

    });
});

describe('selection and bulk selection', () => {
    beforeEach(() => {
        interceptors['successful with some items'](); // comment out if the mock server is running
        interceptors['successful with some items second page']();
        mountTable();

        cy.wait('@getGroups'); // first initial request
    });

    it('can select and deselect groups', () => {
        const middleRow = Math.ceil(DEFAULT_ROW_COUNT / 2);
        selectRowN(middleRow);
        checkSelectedNumber(1);
        selectRowN(Math.ceil(middleRow / 2));
        checkSelectedNumber(2);
        selectRowN(middleRow);
        checkSelectedNumber(1);
    });

    it('can select all in dropdown toggle', () => {
        cy.get(DROPDOWN_TOGGLE).eq(0).click(); // open selection dropdown
        cy.get('.pf-c-dropdown__menu > li').eq(2).click();
        checkSelectedNumber(fixtures.total);
    });

    it('can select all by clicking checkbox', () => {
        cy.get('#toggle-checkbox').eq(0).click();
        checkSelectedNumber(fixtures.total);
        cy.get('#toggle-checkbox').eq(0).click();
        checkSelectedNumber(0);
    });

    it('can select none', () => {
        selectRowN(1);
        cy.get(DROPDOWN_TOGGLE).eq(0).click(); // open selection dropdown
        cy.get('.pf-c-dropdown__menu > li').eq(1).click();
        checkSelectedNumber(0);
    });
});

describe('actions', () => {
    beforeEach(() => {
        interceptors['successful with some items']();
        mountTable();

        cy.wait('@getGroups'); // first initial request
    });

    const TEST_ID = 0;

    it('bulk rename and delete actions are disabled when no items selected', () => {
        cy.get(`${TOOLBAR} ${DROPDOWN}`).eq(1).click(); // open bulk action toolbar
        cy.get(DROPDOWN_ITEM).should('have.class', 'pf-m-disabled');
    });

    it('can rename a group, 1', () => {
        cy.get(ROW).eq(TEST_ID + 1).find(`${DROPDOWN} button`).click();
        cy.get(DROPDOWN_ITEM).contains('Rename group').click();
        cy.get(MODAL).find('h1').should('contain.text', 'Rename group');
        cy.get(MODAL).find('input').should('have.value', fixtures.results[TEST_ID].name);

        cy.wait('@getGroups'); // validate request
    });

    it('can rename a group, 2', () => {
        selectRowN(TEST_ID + 1);
        cy.get(`${TOOLBAR} ${DROPDOWN}`).eq(1).click(); // open bulk action toolbar
        cy.get(DROPDOWN_ITEM).contains('Rename group').click();
        cy.get(MODAL).find('h1').should('contain.text', 'Rename group');
        cy.get(MODAL).find('input').should('have.value', fixtures.results[TEST_ID].name);

        cy.wait('@getGroups'); // validate request
    });

    it('can delete a group, 1', () => {
        cy.get(ROW).eq(TEST_ID + 1).find(`${DROPDOWN} button`).click();
        cy.get(DROPDOWN_ITEM).contains('Delete group').click();
        cy.get(MODAL).find('h1').should('contain.text', 'Delete group?');
        cy.get(MODAL).find('p').should('contain.text', fixtures.results[TEST_ID].name);
    });

    it('can delete a group, 2', () => {
        selectRowN(TEST_ID + 1);
        cy.get(`${TOOLBAR} ${DROPDOWN}`).eq(1).click(); // open bulk action toolbar
        cy.get(DROPDOWN_ITEM).contains('Delete group').click();
        cy.get(MODAL).find('h1').should('contain.text', 'Delete group?');
        cy.get(MODAL).find('p').should('contain.text', fixtures.results[TEST_ID].name);
    });

    it('can delete more groups', () => {
        const TEST_ROWS = [2, 3];
        TEST_ROWS.forEach((row) => selectRowN(row));

        cy.get(`${TOOLBAR} ${DROPDOWN}`).eq(1).click(); // open bulk action toolbar
        cy.get(DROPDOWN_ITEM).contains('Delete groups').click();
        cy.get(MODAL).find('h1').should('contain.text', 'Delete groups?');
        cy.get(MODAL).find('p').should('contain.text', `${TEST_ROWS.length} groups and all their data`);
    });

    it('can create a group', () => {
        cy.get(TOOLBAR).find('button').contains('Create group').click();
        cy.get(MODAL).find('h1').should('contain.text', 'Create group');

        cy.wait('@getGroups'); // validate request
    });
});

describe('edge cases', () => {
    it('no groups match', () => {
        interceptors['successful empty']();
        mountTable();

        cy.wait('@getGroups').then(() => {
            checkEmptyState('No matching groups found', true);
            checkPaginationTotal(0);
        });
    });

    it('failed request', () => {
        interceptors['failed with server error']();
        mountTable();

        cy.wait('@getGroups').then(() => {
            cy.get('.pf-c-empty-state').find('h4').contains('Something went wrong');
            // the filter is disabled
            cy.ouiaId('name-filter').find('input').should('have.attr', 'disabled');
            cy.ouiaId('pager').find('button').should('have.attr', 'disabled');
        });
    });
});
