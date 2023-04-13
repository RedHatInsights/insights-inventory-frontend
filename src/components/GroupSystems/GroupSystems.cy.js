import { mount } from '@cypress/react';
import {
    changePagination,
    checkEmptyState,
    checkPaginationTotal,
    checkPaginationValues,
    checkTableHeaders,
    CHIP,
    CHIP_GROUP,
    DROPDOWN_ITEM,
    DROPDOWN_TOGGLE,
    hasChip,
    MODAL,
    PAGINATION_VALUES,
    SORTING_ORDERS,
    TEXT_INPUT,
    TOOLBAR,
    TOOLBAR_FILTER
} from '@redhat-cloud-services/frontend-components-utilities';
import FlagProvider from '@unleash/proxy-client-react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import {
    featureFlagsInterceptors,
    groupsInterceptors,
    hostsInterceptors,
    systemProfileInterceptors
} from '../../../cypress/support/interceptors';
import { getStore } from '../../store';
import GroupSystems from './GroupSystems';
import fixtures from '../../../cypress/fixtures/hosts.json';
import {
    checkSelectedNumber as checkSelectedNumber_,
    ORDER_TO_URL,
    selectRowN,
    unleashDummyConfig
} from '../../../cypress/support/utils';
import _ from 'lodash';

const GROUP_NAME = 'foobar';
const ROOT = 'div[id="group-systems-table"]';
const TABLE_HEADERS = ['Name', 'Tags', 'OS', 'Update method', 'Last seen'];
const SORTABLE_HEADERS = ['Name', 'OS', 'Last seen'];
const DEFAULT_ROW_COUNT = 50;

const checkSelectedNumber = (number) =>
    checkSelectedNumber_(number, '#bulk-select-systems-toggle-checkbox-text');

const mountTable = () =>
    mount(
        <FlagProvider config={unleashDummyConfig}>
            <Provider store={getStore()}>
                <MemoryRouter>
                    <GroupSystems groupName={GROUP_NAME} />
                </MemoryRouter>
            </Provider>
        </FlagProvider>
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
        cy.intercept('*', { statusCode: 200, body: { results: [] } });

        hostsInterceptors.successful();
        featureFlagsInterceptors.successful();
        systemProfileInterceptors['operating system, successful empty']();
        groupsInterceptors['successful with some items']();
        mountTable();

        cy.get('table[aria-label="Host inventory"]').should('have.attr', 'data-ouia-safe', 'true');
    });

    it('the root container is rendered', () => {
        cy.get(ROOT);
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
        cy.intercept('*', { statusCode: 200, body: { results: [] } });
        hostsInterceptors.successful();
        featureFlagsInterceptors.successful();
        systemProfileInterceptors['operating system, successful empty']();
        groupsInterceptors['successful with some items']();
        mountTable();

        cy.wait('@getHosts');
        cy.get('table[aria-label="Host inventory"]').should('have.attr', 'data-ouia-safe', 'true');
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
        cy.intercept('*', { statusCode: 200, body: { results: [] } });
        hostsInterceptors.successful();
        featureFlagsInterceptors.successful();
        systemProfileInterceptors['operating system, successful empty']();
        groupsInterceptors['successful with some items']();
        mountTable();

        cy.wait('@getHosts');
        cy.get('table[aria-label="Host inventory"]').should('have.attr', 'data-ouia-safe', 'true');
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
                cy.wait('@getHosts')
                .its('request.url')
                .should('include', `per_page=${el}`);
            });
        });
    });

    it('can change page', () => {
        cy.get('button[data-action=next]').eq(0).click(); // click "next page" button
        cy.wait('@getHosts').its('request.url').should('include', `page=2`);
    });
});

describe('sorting', () => {
    beforeEach(() => {
        cy.intercept('*', { statusCode: 200, body: { results: [] } });
        hostsInterceptors.successful();
        featureFlagsInterceptors.successful();
        systemProfileInterceptors['operating system, successful empty']();
        groupsInterceptors['successful with some items']();
        mountTable();

        cy.wait('@getHosts');
        cy.get('table[aria-label="Host inventory"]').should('have.attr', 'data-ouia-safe', 'true');
    });

    const checkSorting = (label, order, dataField) => {
    // get appropriate locators
        const header = `th[data-label="${label}"]`;
        if (order === 'ascending') {
            cy.get(header).find('button').click();
        } else {
            cy.get(header).find('button').click();
            cy.wait('@getHosts'); // TODO: implement debounce for sorting feature
            cy.get(header).find('button').click();
        }

        cy.wait('@getHosts')
        .its('request.url')
        .should('include', `order_how=${ORDER_TO_URL[order]}`)
        .and('include', `order_by=${dataField}`);
    };

    _.zip(
        ['display_name', 'operating_system', 'updated'],
        SORTABLE_HEADERS
    ).forEach(([category, label]) => {
        SORTING_ORDERS.forEach((order) => {
            it(`${order} by ${label}`, () => {
                checkSorting(label, order, category);
            });
        });
    });
});

describe('filtering', () => {
    beforeEach(() => {
        cy.intercept('*', { statusCode: 200, body: { results: [] } });
        hostsInterceptors.successful();
        featureFlagsInterceptors.successful();
        systemProfileInterceptors['operating system, successful empty']();
        groupsInterceptors['successful with some items']();
        mountTable();

        cy.wait('@getHosts');
        cy.get('table[aria-label="Host inventory"]').should('have.attr', 'data-ouia-safe', 'true');
    });

    const applyNameFilter = () =>
        cy.get('.ins-c-primary-toolbar__filter').find('input').type('lorem');
    it('renders filter chip', () => {
        applyNameFilter();
        hasChip('Display name', 'lorem');
        cy.wait('@getHosts');
    });

    it('sends correct request', () => {
        applyNameFilter();
        cy.wait('@getHosts')
        .its('request.url')
        .should('include', 'hostname_or_id=lorem');
    });

    it('can remove the chip or reset filters', () => {
        applyNameFilter();
        cy.wait('@getHosts')
        .its('request.url')
        .should('contain', 'hostname_or_id=lorem');
        cy.get(CHIP_GROUP)
        .find(CHIP)
        .ouiaId('close', 'button')
        .each(() => {
            cy.get(CHIP_GROUP).find(CHIP).ouiaId('close', 'button');
        });
        cy.get('button').contains('Reset filters').click();
        cy.wait('@getHosts')
        .its('request.url')
        .should('not.contain', 'hostname_or_id');

        cy.get(CHIP_GROUP).should('not.exist');

        cy.wait('@getHosts'); // TODO: reset filters shouldn't trigger this second extra call
    });

    it('should not contain group filter', () => {
        cy.get('button[data-ouia-component-id="ConditionalFilter"]').click();
        cy.get(DROPDOWN_ITEM).should('not.contain', 'Group');
    });
    // TODO: add more filter cases
});

describe('selection and bulk selection', () => {
    beforeEach(() => {
        cy.intercept('*', { statusCode: 200, body: { results: [] } });
        hostsInterceptors.successful();
        featureFlagsInterceptors.successful();
        systemProfileInterceptors['operating system, successful empty']();
        groupsInterceptors['successful with some items']();
        mountTable();

        cy.wait('@getHosts');
        cy.get('table[aria-label="Host inventory"]').should('have.attr', 'data-ouia-safe', 'true');
    });

    it('can select and deselect systems', () => {
        const middleRow = Math.ceil(DEFAULT_ROW_COUNT / 4);
        selectRowN(middleRow);
        checkSelectedNumber(1);
        selectRowN(Math.ceil(middleRow / 2));
        checkSelectedNumber(2);
        selectRowN(middleRow);
        checkSelectedNumber(1);
    });

    /*     it('can select all in dropdown toggle', () => {
        cy.get(DROPDOWN_TOGGLE).eq(0).click(); // open selection dropdown
        cy.get('.pf-c-dropdown__menu > li').eq(2).click();
        checkSelectedNumber(fixtures.total);
    }); */

    /* it('can select all by clicking checkbox', () => {
        cy.get('#toggle-checkbox').eq(0).click();
        checkSelectedNumber(fixtures.total);
        cy.get('#toggle-checkbox').eq(0).click();
        checkSelectedNumber(0);
    }); */

    it('can select page in dropdown toggle', () => {
        cy.get(DROPDOWN_TOGGLE).eq(0).click(); // open selection dropdown
        cy.get('.pf-c-dropdown__menu > li').eq(1).click();
        checkSelectedNumber(fixtures.count);
    });

    it('can select page by clicking checkbox', () => {
        cy.get('#bulk-select-systems-toggle-checkbox').eq(0).click();
        checkSelectedNumber(fixtures.count);
        cy.get('#bulk-select-systems-toggle-checkbox').eq(0).click();
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
        cy.intercept('*', { statusCode: 200 });
        hostsInterceptors.successful();
        featureFlagsInterceptors.successful(); // make Groups col available

        mountTable();

        cy.wait('@getHosts');
        cy.get('table[aria-label="Host inventory"]').should('have.attr', 'data-ouia-safe', 'true');
    });

    it('can open systems add modal', () => {
        cy.get('button').contains('Add systems').click();
        cy.get(MODAL).find('h1').contains('Add systems');

        cy.wait('@getHosts');
    });
});

describe('edge cases', () => {
    it('no groups match', () => {
        cy.intercept('*', { statusCode: 200, body: { results: [] } });
        hostsInterceptors['successful empty']();
        featureFlagsInterceptors.successful();
        systemProfileInterceptors['operating system, successful empty']();
        groupsInterceptors['successful with some items']();
        mountTable();

        cy.wait('@getHosts');

        checkEmptyState('No matching systems found', true);
        checkPaginationTotal(0);
    });

    it('failed request', () => {
        cy.intercept('*', { statusCode: 200, body: { results: [] } });
        hostsInterceptors['failed with server error']();
        featureFlagsInterceptors.successful();
        systemProfileInterceptors['operating system, successful empty']();
        mountTable();

        cy.wait('@getHosts');
        cy.get('.pf-c-empty-state').find('h4').contains('Something went wrong');
    });
});
