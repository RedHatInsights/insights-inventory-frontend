/* eslint-disable rulesdir/disallow-fec-relative-imports */
import {
  CHIP,
  CHIP_GROUP,
  DROPDOWN_ITEM,
  MENU_ITEM,
  MENU_TOGGLE,
  MENU_TOGGLE_CHECKBOX,
  MODAL_CONTENT,
  PAGINATION_VALUES,
  PRIMARY_TOOLBAR,
  PRIMARY_TOOLBAR_ACTIONS,
  SORTING_ORDERS,
  TABLE_ROW,
  TABLE_ROW_CHECKBOX,
  TEXT_INPUT,
  changePagination,
  checkEmptyState,
  checkPaginationTotal,
  checkPaginationValues,
  checkSelectedNumber as checkSelectedNumberFec,
  checkTableHeaders,
  hasChip,
  selectRowN,
  PAGINATION_TOP,
  PAGINATION_NEXT,
  PT_CONDITIONAL_FILTER_TOGGLE,
  PT_BULK_SELECT,
} from '@redhat-cloud-services/frontend-components-utilities';
import _, { cloneDeep } from 'lodash';
import fixtures from '../../../cypress/fixtures/hosts.json';
import {
  featureFlagsInterceptors,
  groupsInterceptors,
  hostsInterceptors,
  systemProfileInterceptors,
} from '../../../cypress/support/interceptors';
import { ORDER_TO_URL } from '../../../cypress/support/utils';
import GroupSystems from './GroupSystems';

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

const TEST_ID = hostsAllInGroupFixtures.results[0].groups[0].id;

const checkSelectedNumber = (number) =>
  checkSelectedNumberFec(number, '#bulk-select-systems-toggle-checkbox');

const mountTable = (initialEntries) =>
  cy.mountWithContext(
    GroupSystems,
    initialEntries ? { routerProps: { initialEntries } } : undefined,
    { groupName: GROUP_NAME, groupId: TEST_ID }
  );

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

describe('test data', () => {
  it('first system has name dolor', () => {
    expect(fixtures.results[0].display_name === 'dolor');
  });
});

before(() => {
  cy.mockWindowInsights();
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
    cy.get(PRIMARY_TOOLBAR).should('have.length', 1);
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
    cy.get(PAGINATION_TOP).should('contain.text', `1 - ${DEFAULT_ROW_COUNT}`);
  });

  it('name filter is a default filter', () => {
    cy.get(PRIMARY_TOOLBAR).find(TEXT_INPUT).should('exist');
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
    cy.get(PAGINATION_NEXT).first().click(); // click "next page" button
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
    // get appropriate selectors
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
  beforeEach(() => {
    cy.intercept('*', { statusCode: 200, body: { results: [] } });
    hostsInterceptors.successful();
    featureFlagsInterceptors.successful();
    systemProfileInterceptors['operating system, successful empty']();
    groupsInterceptors['successful with some items']();
  });

  const applyNameFilter = () =>
    cy.get('.ins-c-primary-toolbar__filter').find('input').type('lorem');
  it('renders filter chip', () => {
    mountTable();
    waitForTable(true);

    applyNameFilter();
    hasChip('Display name', 'lorem');
    cy.wait('@getHosts');
  });

  it('sends correct request', () => {
    mountTable();
    waitForTable(true);

    applyNameFilter();
    cy.wait('@getHosts')
      .its('request.url')
      .should('include', 'hostname_or_id=lorem');
  });

  it('can remove the chip or reset filters', () => {
    mountTable();
    waitForTable(true);

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
    mountTable();
    waitForTable(true);

    cy.get(PT_CONDITIONAL_FILTER_TOGGLE).click();
    cy.get(DROPDOWN_ITEM).should('not.contain', 'Group');
  });

  it('should read url pagination', () => {
    mountTable(['/?per_page=10&page=2']);
    waitForTable(true);

    cy.ouiaId('CompactPagination').should('contain.text', '11 - 20');
    cy.get('[aria-label="Current page"]').should('have.value', '2');
  });

  it('should read url filter', () => {
    mountTable(['/?hostname_or_id=test']);
    waitForTable(true);

    hasChip('Display name', 'test');
  });
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
        cy.get('.pf-v5-c-dropdown__menu > li').eq(2).click();
        checkSelectedNumber(fixtures.total);
    }); */

  /* it('can select all by clicking checkbox', () => {
        cy.get('#toggle-checkbox').eq(0).click();
        checkSelectedNumber(fixtures.total);
        cy.get('#toggle-checkbox').eq(0).click();
        checkSelectedNumber(0);
    }); */

  it('can select page in dropdown toggle', () => {
    cy.get(PT_BULK_SELECT).click(); // open selection dropdown
    cy.get(DROPDOWN_ITEM).contains('Select page').click();
    checkSelectedNumber(fixtures.count);
  });

  it('can select page by clicking checkbox', () => {
    cy.get(PRIMARY_TOOLBAR).find(MENU_TOGGLE_CHECKBOX).click();
    checkSelectedNumber(fixtures.count);
    cy.get(PRIMARY_TOOLBAR).find(MENU_TOGGLE_CHECKBOX).click();
    checkSelectedNumber(0);
  });

  it('can select none', () => {
    selectRowN(1);
    cy.get(PT_BULK_SELECT).click(); // open selection dropdown
    cy.get(DROPDOWN_ITEM).contains('Select none (0 items)').click();
    checkSelectedNumber(0);
  });
});

describe('actions', () => {
  beforeEach(() => {
    cy.intercept('*', { statusCode: 200 });
    hostsInterceptors.successful();
    featureFlagsInterceptors.successful(); // make Groups col available
    groupsInterceptors['successful with some items']();

    mountTable();
    waitForTable(true);
  });

  it('can open systems add modal', () => {
    cy.get('button').contains('Add systems').click();
    cy.get(MODAL_CONTENT).find('h1').contains('Add systems');

    cy.wait('@getHosts');
  });

  it('can remove host from group', () => {
    cy.intercept(
      'DELETE',
      `/api/inventory/v1/groups/${TEST_ID}/hosts/${hostsAllInGroupFixtures.results[0].id}`
    ).as('request');
    cy.get(TABLE_ROW).eq(0).find(MENU_TOGGLE).click();
    cy.get(DROPDOWN_ITEM).contains('Remove from group').click();
    cy.get(MODAL_CONTENT).within(() => {
      cy.get('h1').should('have.text', 'Remove from group');
      cy.get('button[type="submit"]').click();
      cy.wait('@request');
    });
  });

  it('can remove more hosts from the same group', () => {
    cy.intercept(
      'DELETE',
      `/api/inventory/v1/groups/${TEST_ID}/hosts/${hostsAllInGroupFixtures.results
        .slice(0, 2)
        .map(({ id }) => id)
        .join(',')}`
    ).as('request');

    cy.get(TABLE_ROW_CHECKBOX).eq(0).click();
    cy.get(TABLE_ROW_CHECKBOX).eq(1).click();

    // TODO: implement ouia selector for this component
    cy.get(PRIMARY_TOOLBAR_ACTIONS).click();

    cy.get(MENU_ITEM).contains('Remove from group').click();

    cy.get(MODAL_CONTENT).within(() => {
      cy.get('h1').should('have.text', 'Remove from group');
      cy.get('button[type="submit"]').click();
      cy.wait('@request');
    });
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
    cy.get('.pf-v5-c-empty-state').find('h4').contains('Something went wrong');
  });
});

const READ_PERMISSIONS_WITH_RD = [
  {
    permission: 'inventory:groups:read',
    resourceDefinitions: [
      {
        attributeFilter: {
          key: 'group.id',
          operation: 'equal',
          value: TEST_ID,
        },
      },
    ],
  },
];

const WRITE_PERMISSIONS_WITH_RD = [
  {
    permission: 'inventory:groups:write',
    resourceDefinitions: [
      {
        attributeFilter: {
          key: 'group.id',
          operation: 'equal',
          value: TEST_ID,
        },
      },
    ],
  },
];

describe('integration with rbac', () => {
  beforeEach(() => {
    cy.intercept('*', { statusCode: 200, body: { results: [] } });
    hostsInterceptors.successful();
    featureFlagsInterceptors.successful();
    systemProfileInterceptors['operating system, successful empty']();
    groupsInterceptors['successful with some items']();
    mountTable();

    waitForTable(true);
  });

  describe('has only read permissions', () => {
    before(() => {
      cy.mockWindowInsights({
        userPermissions: READ_PERMISSIONS_WITH_RD,
      });
    });

    it('the table is rendered', () => {
      cy.get('#group-systems-table').should('exist');
      cy.get(TABLE_ROW).contains('dolor');
    });

    it('no way to add or remove systems', () => {
      cy.get('button').contains('Add systems').shouldHaveAriaDisabled();
      cy.get(PRIMARY_TOOLBAR_ACTIONS).click();
      cy.get(DROPDOWN_ITEM)
        .contains('Remove from group')
        .shouldHaveAriaDisabled();
    });

    it('per-row dropdown should be disabled', () => {
      cy.get(TABLE_ROW).eq(0).find(MENU_TOGGLE).click();
      cy.get('button').contains('Remove from group').shouldHaveAriaDisabled();
    });
  });

  describe('has groups write permissions', () => {
    before(() => {
      cy.mockWindowInsights({
        userPermissions: [
          ...READ_PERMISSIONS_WITH_RD,
          ...WRITE_PERMISSIONS_WITH_RD,
        ],
      });
    });

    it('can remove more hosts from group', () => {
      cy.get(TABLE_ROW_CHECKBOX).eq(0).click();
      cy.get(TABLE_ROW_CHECKBOX).eq(1).click();

      // TODO: implement ouia selector for this component
      cy.get(PRIMARY_TOOLBAR_ACTIONS).click();

      cy.get(DROPDOWN_ITEM).contains('Remove from group').should('be.enabled');
    });

    it('add systems button is enabled', () => {
      cy.get('button').contains('Add systems').shouldHaveAriaEnabled();
    });
  });
});
