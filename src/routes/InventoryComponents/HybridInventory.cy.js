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
} from '../../../cypress/support/interceptors';
import Inventory from './HybridInventory';
import hostTagsFixtures from '../../../cypress/fixtures/hostsTags.json';
import tagsFixtures from '../../../cypress/fixtures/tags.json';
import hostsFixtures from '../../../cypress/fixtures/hosts.json';
import groupsFixtures from '../../../cypress/fixtures/groups.json';
import {
  DROPDOWN_ITEM,
  MENU_ITEM,
  MENU_TOGGLE,
  MODAL_CONTENT,
  PRIMARY_TOOLBAR_ACTIONS,
  SELECT_MENU_ITEM,
  TABLE_ROW,
  TABLE_ROW_CHECKBOX,
} from '@redhat-cloud-services/frontend-components-utilities';
import { INVENTORY_ACTION_MENU_ITEM } from '../../../cypress/support/utils';

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
  cy.mockWindowInsights();
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

describe('hybrid inventory table', () => {
  beforeEach(prepareTest);

  describe('has groups actions', () => {
    it('cannot add host to another group', () => {
      cy.get(TABLE_ROW).eq(0).find(MENU_TOGGLE).click();
      cy.get(DROPDOWN_ITEM)
        .contains('Add to group')
        .should('have.attr', 'aria-disabled', 'true');
    });

    it('cannot remove host without group', () => {
      cy.get(TABLE_ROW_CHECKBOX).eq(3).click();

      // TODO: implement ouia selector for this component
      cy.get(PRIMARY_TOOLBAR_ACTIONS).click();
      cy.get(MENU_ITEM)
        .contains('Remove from group')
        .should('have.attr', 'aria-disabled', 'true');
    });

    it('cannot remove host without group, bulk select', () => {
      cy.get(TABLE_ROW).eq(3).find(MENU_TOGGLE).click();
      cy.get(DROPDOWN_ITEM)
        .contains('Remove from group')
        .should('have.attr', 'aria-disabled', 'true');
    });

    it('can remove from a group', () => {
      cy.intercept(
        'DELETE',
        `/api/inventory/v1/groups/${hostsFixtures.results[0].groups[0].id}/hosts/${hostsFixtures.results[0].id}`
      ).as('request');
      cy.get(TABLE_ROW).eq(0).find(MENU_TOGGLE).click();
      cy.get(DROPDOWN_ITEM).contains('Remove from group').click();
      cy.get(MODAL_CONTENT).within(() => {
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
      cy.get(TABLE_ROW).eq(3).find(MENU_TOGGLE).click();
      cy.get(DROPDOWN_ITEM).contains('Add to group').click();
      cy.get(MODAL_CONTENT).within(() => {
        cy.get('h1').should('have.text', 'Add to group');
        cy.wait('@getGroups');
        cy.get('.pf-v5-c-select__toggle').click(); // TODO: implement ouia selector for this component
        cy.get('.pf-v5-c-select__menu-item').eq(0).click();
        cy.get('button[type="submit"]').click();
        cy.wait('@request')
          .its('request.body')
          .should('deep.equal', [hostsFixtures.results[3].id]);
      });
      cy.wait('@getHosts'); // data must be reloaded
    });

    it('cannot remove hosts from different groups', () => {
      cy.get(TABLE_ROW_CHECKBOX).eq(1).click();
      cy.get(TABLE_ROW_CHECKBOX).eq(2).click();

      // TODO: implement ouia selector for this component
      cy.get(PRIMARY_TOOLBAR_ACTIONS).click();
      cy.get(MENU_ITEM)
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

      cy.get(TABLE_ROW_CHECKBOX).eq(3).click();
      cy.get(TABLE_ROW_CHECKBOX).eq(4).click();

      // TODO: implement ouia selector for this component
      cy.get(PRIMARY_TOOLBAR_ACTIONS).click();

      cy.get(MENU_ITEM).contains('Add to group').click();

      cy.get(MODAL_CONTENT).within(() => {
        cy.get('h1').should('have.text', 'Add to group');
        cy.wait('@getGroups');
        cy.get('.pf-v5-c-select__toggle').click(); // TODO: implement ouia selector for this component
        cy.get(SELECT_MENU_ITEM).contains(TEST_GROUP_NAME).click();
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
      cy.get(TABLE_ROW_CHECKBOX).eq(3).click();
      cy.get(PRIMARY_TOOLBAR_ACTIONS).click();
      cy.get(MENU_ITEM).contains('Add to group').click();
      cy.get(MODAL_CONTENT)
        .find('button')
        .contains('Create a new group')
        .click();
      cy.get(MODAL_CONTENT).find('h1').should('have.text', 'Create group');
    });
  });

  describe('integration with rbac', () => {
    describe('with only read permissions', () => {
      before(() => {
        cy.mockWindowInsights({
          userPermissions: ['inventory:*:read'],
        });
      });

      beforeEach(() => prepareTest(false));

      it('all per-row actions are disabled', () => {
        cy.get(TABLE_ROW).eq(1).find(MENU_TOGGLE).click();
        cy.get(INVENTORY_ACTION_MENU_ITEM).should(
          'have.attr',
          'aria-disabled',
          'true'
        );
      });

      it('bulk actions are disabled', () => {
        cy.get(TABLE_ROW_CHECKBOX).eq(0).click();

        cy.get('button')
          .contains('Delete')
          .should('have.attr', 'aria-disabled', 'true');

        // TODO: implement ouia selector for this component
        cy.get(PRIMARY_TOOLBAR_ACTIONS).click();

        cy.get(MENU_ITEM)
          .contains('Remove from group')
          .should('have.attr', 'aria-disabled', 'true');

        cy.get(MENU_ITEM)
          .contains('Add to group')
          .should('have.attr', 'aria-disabled', 'true');
      });
    });

    describe('with group-level hosts write permissions', () => {
      before(() => {
        cy.mockWindowInsights({
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
        cy.get(TABLE_ROW).eq(1).find(MENU_TOGGLE).click();
        cy.get(INVENTORY_ACTION_MENU_ITEM).contains('Edit').click();
        cy.get(MODAL_CONTENT).contains('Edit display name');
      });

      it('can delete hosts in the test group', () => {
        cy.get(TABLE_ROW).eq(1).find(MENU_TOGGLE).click();
        cy.get(INVENTORY_ACTION_MENU_ITEM).contains('Delete').click();
        cy.get(MODAL_CONTENT).contains('Delete from inventory');
      });

      it('cannot edit nor delete hosts that are not in the test group', () => {
        cy.get(TABLE_ROW).eq(3).find(MENU_TOGGLE).click();
        cy.get(DROPDOWN_ITEM)
          .contains('Edit')
          .should('have.attr', 'aria-disabled', 'true');
        cy.get(DROPDOWN_ITEM)
          .contains('Delete')
          .should('have.attr', 'aria-disabled', 'true');
      });

      it('can delete hosts that are in the test group', () => {
        cy.get(TABLE_ROW_CHECKBOX).eq(0).click();
        cy.get(TABLE_ROW_CHECKBOX).eq(1).click();

        cy.get('button')
          .contains('Delete')
          .should('have.attr', 'aria-disabled', 'false')
          .click();
      });

      it('cannot delete hosts that are not in the test group', () => {
        cy.get(TABLE_ROW_CHECKBOX).eq(2).click();

        cy.get('button')
          .contains('Delete')
          .should('have.attr', 'aria-disabled', 'true');
      });

      it('cannot add or remove from group', () => {
        cy.get(TABLE_ROW).eq(1).find(MENU_TOGGLE).click();
        cy.get(DROPDOWN_ITEM).contains('Add to group').shouldHaveAriaDisabled();
        cy.get(DROPDOWN_ITEM)
          .contains('Remove from group')
          .shouldHaveAriaDisabled();
      });
    });

    describe('with excluding group-level hosts write permissions', () => {
      before(() => {
        cy.mockWindowInsights({
          userPermissions: [
            'inventory:*:read',
            {
              permission: 'inventory:hosts:write',
              resourceDefinitions: [
                {
                  attributeFilter: {
                    key: 'group.id',
                    operation: 'equal',
                    value: null,
                  },
                },
              ],
            },
          ],
        });
      });

      beforeEach(prepareTest);

      it('can edit hosts that are not a part of any group', () => {
        cy.get(TABLE_ROW).eq(4).find(MENU_TOGGLE).click();
        cy.get(DROPDOWN_ITEM).contains('Edit').shouldNotHaveAriaDisabled();
        cy.get(DROPDOWN_ITEM).contains('Delete').shouldNotHaveAriaDisabled();
      });

      it('cannot edit hosts in groups', () => {
        cy.get(TABLE_ROW).eq(2).find(MENU_TOGGLE).click();
        cy.get(DROPDOWN_ITEM).contains('Edit').shouldHaveAriaDisabled();
        cy.get(DROPDOWN_ITEM).contains('Delete').shouldHaveAriaDisabled();
      });

      it('can bulk delete ungrouped hosts', () => {
        cy.get(TABLE_ROW_CHECKBOX).eq(4).click();
        cy.get(TABLE_ROW_CHECKBOX).eq(5).click();
        cy.get('button').contains('Delete').shouldHaveAriaEnabled();
      });

      it('cannot mix grouped and ungrouped hosts', () => {
        cy.get(TABLE_ROW_CHECKBOX).eq(2).click();
        cy.get(TABLE_ROW_CHECKBOX).eq(3).click();
        cy.get('button').contains('Delete').shouldHaveAriaDisabled();
      });
    });

    describe('with limited groups write permissions', () => {
      before(() => {
        cy.mockWindowInsights({
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
        cy.get(TABLE_ROW).eq(1).find(MENU_TOGGLE).click();
        cy.get(DROPDOWN_ITEM).contains('Add to group').shouldHaveAriaDisabled();
        cy.get(DROPDOWN_ITEM)
          .contains('Remove from group')
          .shouldNotHaveAriaDisabled();
      });

      it('add to group is enabled for ungroupped hosts', () => {
        cy.get(TABLE_ROW).eq(4).find(MENU_TOGGLE).click();
        cy.get(DROPDOWN_ITEM)
          .contains('Add to group')
          .shouldNotHaveAriaDisabled();
        cy.get(DROPDOWN_ITEM)
          .contains('Remove from group')
          .shouldHaveAriaDisabled();
      });

      it('can bulk remove from the permitted group', () => {
        cy.get(TABLE_ROW_CHECKBOX).eq(0).click();
        // TODO: implement ouia selector for this component
        cy.get(PRIMARY_TOOLBAR_ACTIONS).click();
        cy.get(MENU_ITEM)
          .contains('Remove from group')
          .shouldNotHaveAriaDisabled();
        cy.get(TABLE_ROW_CHECKBOX).eq(1).click();
        // TODO: implement ouia selector for this component
        cy.get(PRIMARY_TOOLBAR_ACTIONS).click();
        cy.get(MENU_ITEM)
          .contains('Remove from group')
          .shouldNotHaveAriaDisabled();
      });

      it('can bulk remove from group together with ungroupped hosts', () => {
        cy.get(TABLE_ROW_CHECKBOX).eq(0).click();
        cy.get(TABLE_ROW_CHECKBOX).eq(3).click();
        // TODO: implement ouia selector for this component
        cy.get(PRIMARY_TOOLBAR_ACTIONS).click();
        cy.get(DROPDOWN_ITEM)
          .contains('Remove from group')
          .shouldNotHaveAriaDisabled();
      });

      it('can bulk add hosts to the permitted group', () => {
        cy.get(TABLE_ROW_CHECKBOX).eq(3).click();
        cy.get(TABLE_ROW_CHECKBOX).eq(4).click();
        // TODO: implement ouia selector for this component
        cy.get(PRIMARY_TOOLBAR_ACTIONS).click();
        cy.get(MENU_ITEM).contains('Add to group').shouldNotHaveAriaDisabled();
      });

      it('cannot bulk add to group if groupped hosts selected', () => {
        cy.get(TABLE_ROW_CHECKBOX).eq(0).click();
        cy.get(TABLE_ROW_CHECKBOX).eq(3).click();
        // TODO: implement ouia selector for this component
        cy.get(PRIMARY_TOOLBAR_ACTIONS).click();
        cy.get(MENU_ITEM).contains('Add to group').shouldHaveAriaDisabled();
      });
    });
  });
});
