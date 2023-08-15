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

const TEST_GROUP_NAME = 'ancd';
const TEST_GROUP_ID = '54b302e4-07d2-45c5-b2f8-92a286847f9d';

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
  it(`first two hosts in the group ${TEST_GROUP_NAME}`, () => {
    expect(
      hostsFixtures.results
        .slice(0, 2)
        .every(({ groups }) => groups[0].name === TEST_GROUP_NAME)
    ).to.be.true;
  });

  it(`the third host has a group different to ${TEST_GROUP_NAME}`, () => {
    expect(hostsFixtures.results[2].groups[0].name !== TEST_GROUP_NAME).to.be
      .true;
  });

  it(`groups has the group ${TEST_GROUP_NAME}`, () => {
    expect(groupsFixtures.results.some(({ name }) => name === TEST_GROUP_NAME))
      .to.be.true;
  });

  it('the fourth and fifth hosts are not in a group', () => {
    expect(hostsFixtures.results[3].groups.length === 0).to.be.true;
    expect(hostsFixtures.results[4].groups.length === 0).to.be.true;
  });
});

const prepareTest = (waitNetwork = true) => {
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
  waitForTable(waitNetwork);
};

describe('inventory table', () => {
  beforeEach(prepareTest);

  describe('has groups actions', () => {
    it('cannot add host to another group', () => {
      cy.get(ROW).eq(1).find(DROPDOWN).click();
      cy.get(`${DROPDOWN_ITEM} a`)
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
      cy.get(`${DROPDOWN_ITEM} a`).contains('Remove from group').click();
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
      cy.get(`${DROPDOWN_ITEM} a`).contains('Add to group').click();
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
          groupsFixtures.results.find(({ name }) => name === TEST_GROUP_NAME)
            ?.id
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
        cy.get('.pf-c-select__menu-item').contains(TEST_GROUP_NAME).click();
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

      beforeEach(() => prepareTest(false));

      it('all per-row actions are disabled', () => {
        cy.get(ROW).eq(1).find(DROPDOWN).click();
        cy.get(`${DROPDOWN_ITEM} a`).each(($el) =>
          cy.wrap($el).should('have.attr', 'aria-disabled', 'true')
        );
      });

      it('bulk actions are disabled', () => {
        cy.get(ROW).find('[type="checkbox"]').eq(0).click();

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

    describe('with group-level hosts write permissions', () => {
      before(() => {
        cy.mockWindowChrome({
          userPermissions: [
            'inventory:*:read',
            {
              permission: 'inventory:hosts:write',
              resourceDefinitions: [
                {
                  attributeFilter: {
                    key: 'group.id',
                    operation: 'equal',
                    value: TEST_GROUP_ID,
                  },
                },
              ],
            },
          ],
        });
      });

      beforeEach(() => prepareTest(false));

      it('can edit hosts that in the test group', () => {
        cy.get(ROW).eq(1).find(DROPDOWN).click();
        cy.get(`${DROPDOWN_ITEM} a`)
          .contains('Edit')
          .should('have.attr', 'aria-disabled', 'false')
          .click();
        cy.get('button').contains('Cancel').click();
        cy.get(ROW).eq(1).find(DROPDOWN).click();
      });

      it('can delete hosts in the test group', () => {
        cy.get(ROW).eq(1).find(DROPDOWN).click();
        cy.get(`${DROPDOWN_ITEM} a`)
          .contains('Delete')
          .should('have.attr', 'aria-disabled', 'false')
          .click();
        cy.get('button').contains('Cancel').click();
      });

      it('cannot edit nor delete hosts that are not in the test group', () => {
        cy.get(ROW).eq(3).find(DROPDOWN).click();
        cy.get(`${DROPDOWN_ITEM} a`)
          .contains('Edit')
          .should('have.attr', 'aria-disabled', 'true');
        cy.get(`${DROPDOWN_ITEM} a`)
          .contains('Delete')
          .should('have.attr', 'aria-disabled', 'true');
      });

      it('can delete hosts that are in the test group', () => {
        cy.get(ROW).find('[type="checkbox"]').eq(0).click();
        cy.get(ROW).find('[type="checkbox"]').eq(1).click();

        cy.get('button')
          .contains('Delete')
          .should('have.attr', 'aria-disabled', 'false')
          .click();
      });

      it('cannot delete hosts that are not in the test group', () => {
        cy.get(ROW).find('[type="checkbox"]').eq(2).click();

        cy.get('button')
          .contains('Delete')
          .should('have.attr', 'aria-disabled', 'true');
      });

      it('cannot add or remove from group', () => {
        cy.get(ROW).eq(1).find(DROPDOWN).click();
        cy.get(DROPDOWN_ITEM).contains('Add to group').shouldHaveAriaDisabled();
        cy.get(DROPDOWN_ITEM)
          .contains('Remove from group')
          .shouldHaveAriaDisabled();
      });
    });

    describe('with limited groups write permissions', () => {
      before(() => {
        cy.mockWindowChrome({
          userPermissions: [
            'inventory:*:read',
            {
              permission: 'inventory:groups:write',
              resourceDefinitions: [
                {
                  attributeFilter: {
                    key: 'group.id',
                    operation: 'equal',
                    value: TEST_GROUP_ID,
                  },
                },
              ],
            },
          ],
        });
      });

      beforeEach(() => prepareTest(false));

      it('can remove from permitted group', () => {
        cy.get(ROW).eq(1).find(DROPDOWN).click();
        cy.get(DROPDOWN_ITEM).contains('Add to group').shouldHaveAriaDisabled();
        cy.get(DROPDOWN_ITEM)
          .contains('Remove from group')
          .shouldHaveAriaEnabled();
      });

      it('add to group is enabled for ungroupped hosts', () => {
        cy.get(ROW).eq(4).find(DROPDOWN).click();
        cy.get(DROPDOWN_ITEM).contains('Add to group').shouldHaveAriaEnabled();
        cy.get(DROPDOWN_ITEM)
          .contains('Remove from group')
          .shouldHaveAriaDisabled();
      });

      it('can bulk remove from the permitted group', () => {
        cy.get(ROW).find('[type="checkbox"]').eq(0).click();
        // TODO: implement ouia selector for this component
        cy.get(
          '.ins-c-primary-toolbar__actions [aria-label="Actions"]'
        ).click();
        cy.get(DROPDOWN_ITEM)
          .contains('Remove from group')
          .shouldHaveAriaEnabled();
        cy.get(ROW).find('[type="checkbox"]').eq(1).click();
        // TODO: implement ouia selector for this component
        cy.get(
          '.ins-c-primary-toolbar__actions [aria-label="Actions"]'
        ).click();
        cy.get(DROPDOWN_ITEM)
          .contains('Remove from group')
          .shouldHaveAriaEnabled();
      });

      it('can bulk remove from group together with ungroupped hosts', () => {
        cy.get(ROW).find('[type="checkbox"]').eq(0).click();
        cy.get(ROW).find('[type="checkbox"]').eq(3).click();
        // TODO: implement ouia selector for this component
        cy.get(
          '.ins-c-primary-toolbar__actions [aria-label="Actions"]'
        ).click();
        cy.get(DROPDOWN_ITEM)
          .contains('Remove from group')
          .shouldHaveAriaEnabled();
      });

      it('can bulk add hosts to the permitted group', () => {
        cy.get(ROW).find('[type="checkbox"]').eq(3).click();
        cy.get(ROW).find('[type="checkbox"]').eq(4).click();
        // TODO: implement ouia selector for this component
        cy.get(
          '.ins-c-primary-toolbar__actions [aria-label="Actions"]'
        ).click();
        cy.get(DROPDOWN_ITEM).contains('Add to group').shouldHaveAriaEnabled();
      });

      it('cannot bulk add to group if groupped hosts selected', () => {
        cy.get(ROW).find('[type="checkbox"]').eq(0).click();
        cy.get(ROW).find('[type="checkbox"]').eq(3).click();
        // TODO: implement ouia selector for this component
        cy.get(
          '.ins-c-primary-toolbar__actions [aria-label="Actions"]'
        ).click();
        cy.get(DROPDOWN_ITEM).contains('Add to group').shouldHaveAriaDisabled();
      });
    });
  });
});
