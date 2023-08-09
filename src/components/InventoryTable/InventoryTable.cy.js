/* eslint-disable rulesdir/disallow-fec-relative-imports */
/**
 * Cypress tests aim mainly to verify the correct behavior of network calls,
 * compliance with the filter, sorting and pagination scenarios.
 */
import {
  CHIP,
  CHIP_GROUP,
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

before(() => {
  cy.window().then(
    // one of the fec dependencies talks to window.insights.chrome
    (window) =>
      (window.insights = {
        chrome: {
          getUserPermissions: () => ['inventory:*:*'], // enable all read/write features
          isProd: false,
          auth: {
            getUser: () => {
              return Promise.resolve({});
            },
          },
        },
      })
  );
});

describe('with default parameters', () => {
  beforeEach(() => {
    featureFlagsInterceptors.successful();
    systemProfileInterceptors['operating system, successful empty']();
    groupsInterceptors['successful with some items']();
    hostsInterceptors.successful();
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

    // TODO: add more filter cases
  });
});
