/* eslint-disable rulesdir/disallow-fec-relative-imports */
import {
  CHIP,
  CHIP_GROUP,
  DROPDOWN,
  DROPDOWN_ITEM,
  DROPDOWN_TOGGLE,
  MODAL,
  PAGINATION_VALUES,
  ROW,
  SORTING_ORDERS,
  TEXT_INPUT,
  TOOLBAR,
  TOOLBAR_FILTER,
  changePagination,
  checkEmptyState,
  checkPaginationTotal,
  checkPaginationValues,
  checkTableHeaders,
  hasChip,
} from '@redhat-cloud-services/frontend-components-utilities';
import {
  featureFlagsInterceptors,
  groupsInterceptors,
  hostsInterceptors,
  systemProfileInterceptors,
} from '../../../cypress/support/interceptors';
import GroupSystems from './GroupSystems';
import fixtures from '../../../cypress/fixtures/hosts.json';
import {
  ORDER_TO_URL,
  checkSelectedNumber as checkSelectedNumber_,
  selectRowN,
} from '../../../cypress/support/utils';
import _, { cloneDeep } from 'lodash';

const GROUP_NAME = 'foobar';
const ROOT = 'div[id="group-systems-table"]';
const TABLE_HEADERS = ['Name', 'Tags', 'OS', 'Update method', 'Last seen'];
const SORTABLE_HEADERS = ['Name', 'OS', 'Last seen'];
const DEFAULT_ROW_COUNT = 50;

const hostsAllInGroupFixtures = cloneDeep(fixtures);
hostsAllInGroupFixtures.results = hostsAllInGroupFixtures.results.map(
  (host) => ({
    ...host,
    groups: [
      {
        id: '54b302e4-07d2-45c5-b2f8-92a286847f9d',
        name: 'ancd',
      },
    ],
  })
);

const checkSelectedNumber = (number) =>
  checkSelectedNumber_(number, '#bulk-select-systems-toggle-checkbox-text');

const mountTable = () =>
  cy.mountWithContext(GroupSystems, {}, { groupName: GROUP_NAME });

const waitForTable = (waitNetwork = false) => {
  if (waitNetwork) {
    // required for correct requests verifying in sub tests
    cy.wait('@getHosts');
  }

  // indicating the table is loaded
  cy.get('table[aria-label="Host inventory"]').should(
    'have.attr',
    'data-ouia-safe',
    'true'
  );
};

before(() => {
  cy.mockWindowChrome();
});

describe('renders correctly', () => {
  beforeEach(() => {
    cy.intercept('*', { statusCode: 200, body: { results: [] } });

    hostsInterceptors.successful(hostsAllInGroupFixtures);
    featureFlagsInterceptors.successful();
    systemProfileInterceptors['operating system, successful empty']();
    groupsInterceptors['successful with some items']();

    mountTable();

    waitForTable();
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

    waitForTable(true);
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

    waitForTable(true);
  });

  it('shows correct total number of hosts', () => {
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

    waitForTable(true);
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

    waitForTable(true);
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

    waitForTable(true);
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
    waitForTable(true);
  });

  it('can open systems add modal', () => {
    cy.get('button').contains('Add systems').click();
    cy.get(MODAL).find('h1').contains('Add systems');

    cy.wait('@getHosts');
  });

  it('can remove host from group', () => {
    cy.intercept(
      'DELETE',
      `/api/inventory/v1/groups/${hostsAllInGroupFixtures.results[0].groups[0].id}/hosts/${hostsAllInGroupFixtures.results[0].id}`
    ).as('request');
    cy.get(ROW).eq(1).find(DROPDOWN).click();
    cy.get(DROPDOWN_ITEM).contains('Remove from group').click();
    cy.get(MODAL).within(() => {
      cy.get('h1').should('have.text', 'Remove from group');
      cy.get('button[type="submit"]').click();
      cy.wait('@request');
    });
  });

  it('can remove more hosts from the same group', () => {
    cy.intercept(
      'DELETE',
      `/api/inventory/v1/groups/${
        hostsAllInGroupFixtures.results[0].groups[0].id
      }/hosts/${hostsAllInGroupFixtures.results
        .slice(0, 2)
        .map(({ id }) => id)
        .join(',')}`
    ).as('request');

    cy.get(ROW).find('[type="checkbox"]').eq(0).click();
    cy.get(ROW).find('[type="checkbox"]').eq(1).click();

    // TODO: implement ouia selector for this component
    cy.get('.ins-c-primary-toolbar__actions [aria-label="Actions"]').click();

    cy.get(DROPDOWN_ITEM).contains('Remove from group').click();

    cy.get(MODAL).within(() => {
      cy.get('h1').should('have.text', 'Remove from group');
      cy.get('button[type="submit"]').click();
      cy.wait('@request');
    });
    cy.wait('@getHosts'); // data must be reloaded
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

    waitForTable();

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
