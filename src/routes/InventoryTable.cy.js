/* eslint-disable rulesdir/disallow-fec-relative-imports */
/**
 * The file contains the tests relevant to the Inventory table (/inventory).
 * The tests for the federal module are implemented in another cy spec.
 */

import {
  featureFlagsInterceptors,
  groupsInterceptors,
  hostsInterceptors,
  systemProfileInterceptors,
} from '../../cypress/support/interceptors';
import Inventory from './InventoryTable';
import hostTagsFixtures from '../../cypress/fixtures/hostsTags.json';
import tagsFixtures from '../../cypress/fixtures/tags.json';
import hostsFixtures from '../../cypress/fixtures/hosts.json';
import groupsFixtures from '../../cypress/fixtures/groups.json';
import {
  DROPDOWN,
  DROPDOWN_ITEM,
  MODAL,
  ROW,
} from '@redhat-cloud-services/frontend-components-utilities';

const TEST_GROUP = 'ancd';

const mountTable = (props = { hasAccess: true }) => {
  cy.mountWithContext(Inventory, {}, props);
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
  cy.mockWindowChrome();
});

describe('test data', () => {
  it(`first two hosts in the group ${TEST_GROUP}`, () => {
    expect(
      hostsFixtures.results
        .slice(0, 2)
        .every(({ groups }) => groups[0].name === TEST_GROUP)
    ).to.be.true;
  });

  it(`the third host has a group differente that ${TEST_GROUP}`, () => {
    expect(hostsFixtures.results[2].groups[0].name !== TEST_GROUP).to.be.true;
  });

  it(`groups has the group ${TEST_GROUP}`, () => {
    expect(groupsFixtures.results.some(({ name }) => name === TEST_GROUP)).to.be
      .true;
  });

  it('the fourth host is not in a group', () => {
    expect(hostsFixtures.results[3].groups.length === 0).to.be.true;
  });
});

const prepareTest = () => {
  cy.intercept(/\/api\/inventory\/v1\/hosts\/.*\/tags.*/, {
    statusCode: 200,
    body: hostTagsFixtures,
  });
  cy.intercept('/api/inventory/v1/tags*', {
    statusCode: 200,
    body: tagsFixtures,
  });
  featureFlagsInterceptors.successful();
  systemProfileInterceptors['operating system, successful empty']();
  groupsInterceptors['successful with some items']();
  hostsInterceptors.successful();
  mountTable();
  waitForTable(true);
};

describe('inventory table', () => {
  beforeEach(prepareTest);

  describe('has groups actions', () => {
    it('cannot add host to another group', () => {
      cy.get(ROW).eq(1).find(DROPDOWN).click();
      cy.get(DROPDOWN_ITEM)
        .contains('Add to group')
        .should('have.attr', 'aria-disabled', 'true');
    });

    it('cannot remove host without group', () => {
      cy.get(ROW).find('[type="checkbox"]').eq(3).click();

      // TODO: implement ouia selector for this component
      cy.get('.ins-c-primary-toolbar__actions [aria-label="Actions"]').click();
      cy.get(DROPDOWN_ITEM)
        .contains('Remove from group')
        .should('have.attr', 'aria-disabled', 'true');
    });

    it('cannot remove host without group, bulk select', () => {
      cy.get(ROW).eq(4).find(DROPDOWN).click();
      cy.get(DROPDOWN_ITEM)
        .contains('Remove from group')
        .should('have.attr', 'aria-disabled', 'true');
    });

    it('can remove from a group', () => {
      cy.intercept(
        'DELETE',
        `/api/inventory/v1/groups/${hostsFixtures.results[0].groups[0].id}/hosts/${hostsFixtures.results[0].id}`
      ).as('request');
      cy.get(ROW).eq(1).find(DROPDOWN).click();
      cy.get(DROPDOWN_ITEM).contains('Remove from group').click();
      cy.get(MODAL).within(() => {
        cy.get('h1').should('have.text', 'Remove from group');
        cy.get('button[type="submit"]').click();
        cy.wait('@request');
      });
      cy.wait('@getHosts'); // data must be reloaded
    });

    it('can add to existing group', () => {
      cy.intercept(
        'POST',
        `/api/inventory/v1/groups/${groupsFixtures.results[0].id}/hosts`
      ).as('request');
      cy.get(ROW).eq(4).find(DROPDOWN).click();
      cy.get(DROPDOWN_ITEM).contains('Add to group').click();
      cy.get(MODAL).within(() => {
        cy.get('h1').should('have.text', 'Add to group');
        cy.wait('@getGroups');
        cy.get('.pf-c-select__toggle').click(); // TODO: implement ouia selector for this component
        cy.get('.pf-c-select__menu-item').eq(0).click();
        cy.get('button[type="submit"]').click();
        cy.wait('@request')
          .its('request.body')
          .should('deep.equal', [hostsFixtures.results[3].id]);
      });
      cy.wait('@getHosts'); // data must be reloaded
    });

    it('cannot remove hosts from different groups', () => {
      cy.get(ROW).find('[type="checkbox"]').eq(1).click();
      cy.get(ROW).find('[type="checkbox"]').eq(2).click();

      // TODO: implement ouia selector for this component
      cy.get('.ins-c-primary-toolbar__actions [aria-label="Actions"]').click();
      cy.get(DROPDOWN_ITEM)
        .contains('Remove from group')
        .should('have.attr', 'aria-disabled', 'true');
    });

    it('can remove more hosts from the same group', () => {
      cy.intercept(
        'DELETE',
        `/api/inventory/v1/groups/${
          hostsFixtures.results[0].groups[0].id
        }/hosts/${hostsFixtures.results
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

    it('can add more hosts to existing group', () => {
      cy.intercept(
        'POST',
        `/api/inventory/v1/groups/${
          groupsFixtures.results.find(({ name }) => name === TEST_GROUP)?.id
        }/hosts`
      ).as('request');

      cy.get(ROW).find('[type="checkbox"]').eq(3).click();
      cy.get(ROW).find('[type="checkbox"]').eq(4).click();

      // TODO: implement ouia selector for this component
      cy.get('.ins-c-primary-toolbar__actions [aria-label="Actions"]').click();

      cy.get(DROPDOWN_ITEM).contains('Add to group').click();

      cy.get(MODAL).within(() => {
        cy.get('h1').should('have.text', 'Add to group');
        cy.wait('@getGroups');
        cy.get('.pf-c-select__toggle').click(); // TODO: implement ouia selector for this component
        cy.get('.pf-c-select__menu-item').contains(TEST_GROUP).click();
        cy.get('button[type="submit"]').click();
        cy.wait('@request')
          .its('request.body')
          .should(
            'deep.equal',
            hostsFixtures.results.slice(3, 5).map(({ id }) => id)
          );
      });
      cy.wait('@getHosts'); // data must be reloaded
    });

    it('can add to a new group', () => {
      cy.get(ROW).find('[type="checkbox"]').eq(3).click();
      cy.get('.ins-c-primary-toolbar__actions [aria-label="Actions"]').click();
      cy.get(DROPDOWN_ITEM).contains('Add to group').click();
      cy.get(MODAL).find('button').contains('Create a new group').click();
      cy.get(MODAL).find('h1').should('have.text', 'Create group');
    });
  });

  describe('integration with rbac', () => {
    describe('with only read permissions', () => {
      before(() => {
        cy.mockWindowChrome({
          userPermissions: ['inventory:*:read'],
        });
      });

      beforeEach(prepareTest);

      it('all per-row actions are disabled', () => {
        cy.get(ROW).eq(1).find(DROPDOWN).click();
        cy.get(DROPDOWN_ITEM).each(($el) =>
          cy.wrap($el).should('have.attr', 'aria-disabled', 'true')
        );
      });

      it('bulk actions are disabled', () => {
        cy.get('button')
          .contains('Delete')
          .should('have.attr', 'aria-disabled', 'true');

        // TODO: implement ouia selector for this component
        cy.get(
          '.ins-c-primary-toolbar__actions [aria-label="Actions"]'
        ).click();

        cy.get(DROPDOWN_ITEM)
          .contains('Remove from group')
          .should('have.attr', 'aria-disabled', 'true');

        cy.get(DROPDOWN_ITEM)
          .contains('Add to group')
          .should('have.attr', 'aria-disabled', 'true');
      });
    });
  });
});
