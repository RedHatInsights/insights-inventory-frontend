/* eslint-disable rulesdir/disallow-fec-relative-imports */
/**
 * Cypress tests aim mainly to verify the correct behavior of network calls,
 * compliance with the filter, sorting and pagination scenarios.
 */
import {
  CHIP,
  CHIP_GROUP,
  DROPDOWN_ITEM,
  PAGINATION_VALUES,
  SORTING_ORDERS,
  TABLE,
  TEXT_INPUT,
  TOOLBAR,
  TOOLBAR_FILTER,
  changePagination,
  checkPaginationTotal,
  checkPaginationValues,
  checkTableHeaders,
  hasChip,
} from '@redhat-cloud-services/frontend-components-utilities';
import _ from 'lodash';
import {
  featureFlagsInterceptors,
  groupsInterceptors,
  hostsFixtures,
  hostsInterceptors,
  systemProfileInterceptors,
} from '../../../cypress/support/interceptors';
import { ORDER_TO_URL } from '../../../cypress/support/utils';
import InventoryTable from './InventoryTable';
import groupsFixtures from '../../../cypress/fixtures/groups.json';

const TABLE_HEADERS = ['Name', 'Group', 'OS', 'Last seen'];
const DEFAULT_ROW_COUNT = 50;
const SORTABLE_HEADERS = ['Name', 'OS', 'Last seen'];

const mountTable = (props = { hasAccess: true }) => {
  cy.mountWithContext(InventoryTable, {}, props);
};

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

const shorterGroupsFixtures = {
  ...groupsFixtures,
  count: 10,
  total: 10,
  results: groupsFixtures.results.slice(0, 10),
};

const AVAILABLE_FILTER_NAMES = [
  'Name',
  'Status',
  'Operating System',
  'Data Collector',
  'RHC status',
  'Last seen',
  'Group',
];

const setTableInterceptors = () => {
  featureFlagsInterceptors.successful();
  systemProfileInterceptors['operating system, successful empty']();
  groupsInterceptors['successful with some items'](shorterGroupsFixtures);
  hostsInterceptors.successful();
};

describe('with default parameters', () => {
  before(() => {
    cy.mockWindowChrome();
  });

  beforeEach(() => {
    setTableInterceptors();
    mountTable();
    waitForTable(true);
  });

  describe('renders correctly', () => {
    it('renders main components', () => {
      cy.get(TOOLBAR).should('have.length', 1);
      cy.get(TABLE).should('have.length', 1);
    });

    it('renders default set of headers', () => {
      checkTableHeaders(TABLE_HEADERS);
    });
  });

  describe('defaults', () => {
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
    it('shows correct total number of groups', () => {
      checkPaginationTotal(hostsFixtures.total);
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
    const checkSorting = (label, order, dataField) => {
      // get appropriate locators
      const header = `.ins-c-entity-table th[data-label="${label}"]`;
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
    });

    it('has correct list of default filters', () => {
      cy.get('button[data-ouia-component-id="ConditionalFilter"]').click();
      AVAILABLE_FILTER_NAMES.forEach((filterName, index) => {
        cy.get(DROPDOWN_ITEM).eq(index).should('have.text', filterName);
      });
    });

    describe('groups filter', () => {
      it('options are populated correctly', () => {
        cy.get('button[data-ouia-component-id="ConditionalFilter"]').click();
        cy.get(DROPDOWN_ITEM).contains('Group').click();
        cy.ouiaId('FilterByGroup').click();
        cy.ouiaId('FilterByGroupOption').should(
          'have.text',
          shorterGroupsFixtures.results.map(({ name }) => name).join('')
        );
      });

      const firstGroupName = shorterGroupsFixtures.results[0].name;

      it('creates a chip', () => {
        cy.get('button[data-ouia-component-id="ConditionalFilter"]').click();
        cy.get(DROPDOWN_ITEM).contains('Group').click();
        cy.ouiaId('FilterByGroup').click();
        cy.ouiaId('FilterByGroupOption').eq(0).click();
        hasChip('Group', firstGroupName);
      });

      it('triggers new request', () => {
        cy.get('button[data-ouia-component-id="ConditionalFilter"]').click();
        cy.get(DROPDOWN_ITEM).contains('Group').click();
        cy.ouiaId('FilterByGroup').click();
        cy.ouiaId('FilterByGroupOption').eq(0).click();
        cy.wait('@getHosts')
          .its('request.url')
          .should('include', `group_name=${firstGroupName}`);
      });
    });

    // TODO: add more filter cases
  });
});

describe('hiding filters', () => {
  before(cy.mockWindowChrome);

  beforeEach(() => setTableInterceptors());

  it('can hide all filters', () => {
    mountTable({ hasAccess: true, hideFilters: { all: true } });
    waitForTable();
    cy.get('button[data-ouia-component-id="ConditionalFilter"]').should(
      'not.exist'
    );
  });

  it('can hide groups filter', () => {
    mountTable({ hasAccess: true, hideFilters: { hostGroupFilter: true } });
    waitForTable();
    cy.get('button[data-ouia-component-id="ConditionalFilter"]').click();
    cy.get(DROPDOWN_ITEM).should('not.contain', 'Group');
  });

  it('can hide name filter', () => {
    mountTable({ hasAccess: true, hideFilters: { name: true } });
    waitForTable();
    cy.get('button[data-ouia-component-id="ConditionalFilter"]').click();
    cy.get(DROPDOWN_ITEM).should('not.contain', 'Name');
  });

  it('can hide data collector filter', () => {
    mountTable({ hasAccess: true, hideFilters: { registeredWith: true } });
    waitForTable();
    cy.get('button[data-ouia-component-id="ConditionalFilter"]').click();
    cy.get(DROPDOWN_ITEM).should('not.contain', 'Data Collector');
  });

  it('can hide rhcd filter', () => {
    mountTable({ hasAccess: true, hideFilters: { rhcdFilter: true } });
    waitForTable();
    cy.get('button[data-ouia-component-id="ConditionalFilter"]').click();
    cy.get(DROPDOWN_ITEM).should('not.contain', 'RHC status');
  });

  it('can hide os filter', () => {
    mountTable({ hasAccess: true, hideFilters: { operatingSystem: true } });
    waitForTable();
    cy.get('button[data-ouia-component-id="ConditionalFilter"]').click();
    cy.get(DROPDOWN_ITEM).should('not.contain', 'Operating System');
  });

  it('can hide last seen filter', () => {
    mountTable({ hasAccess: true, hideFilters: { lastSeen: true } });
    waitForTable();
    cy.get('button[data-ouia-component-id="ConditionalFilter"]').click();
    cy.get(DROPDOWN_ITEM).should('not.contain', 'Last seen');
  });
});
