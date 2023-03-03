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
    DROPDOWN_TOGGLE
} from '@redhat-cloud-services/frontend-components-utilities';
import _ from 'lodash';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import fixtures from '../../../cypress/fixtures/groups.json';
import { groupsInterceptors as interceptors } from '../../../cypress/support/interceptors';
import { getStore } from '../../store';
import GroupsTable from './GroupsTable';

const ORDER_TO_URL = {
    ascending: 'ASC',
    descending: 'DESC'
};

const DEFAULT_ROW_COUNT = 50;
const TABLE_HEADERS = ['Name', 'Total systems', 'Last modified'];
const ROOT = 'div[id="groups-table"]';

export const checkSelectedNumber = (number) => {
    if (number === 0) {
        cy.get('#toggle-checkbox-text').should('not.exist');
    } else {
        cy.get('#toggle-checkbox-text').should('have.text', `${number} selected`);
    }
};

export const selectRowN = (number) => {
    cy.get(ROW).eq(number).find('.pf-c-table__check').click();
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
        interceptors['successful with some items'](); // comment out if the mock server is running
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

    it('can change page', () => {
        cy.wait('@getGroups');
        cy.get('button[data-action=next]').eq(0).click(); // click "next page" button
        cy.wait('@getGroups').its('request.url').should('include', `page=2`);
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

    const applyNameFilter = () =>
        cy.get('.ins-c-primary-toolbar__filter').find('input').type('lorem');
    ;

    it('renders filter chip', () => {
        applyNameFilter();
        hasChip('Name', 'lorem');
    });

    it('sends correct request', () => {
        applyNameFilter().then(() => {
            cy.wait('@getGroups')
            .its('request.url')
            .should('include', 'hostname_or_id=lorem');
        });
    });

    it('can remove the chip or reset filters', () => {
        applyNameFilter();
        cy.wait('@getGroups');
        cy.get(CHIP_GROUP)
        .find(CHIP)
        .ouiaId('close', 'button')
        .each(() => {
            cy.get(CHIP_GROUP).find(CHIP).ouiaId('close', 'button');
        });
        cy.get('button').contains('Reset filters').click();
        cy.wait('@getGroups');
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
