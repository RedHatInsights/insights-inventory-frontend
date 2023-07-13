/* eslint-disable rulesdir/disallow-fec-relative-imports */
import {
  DROPDOWN,
  DROPDOWN_ITEM,
  MODAL,
} from '@redhat-cloud-services/frontend-components-utilities';
import groupDetailFixtures from '../../../cypress/fixtures/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C.json';
import {
  groupDetailInterceptors,
  groupsInterceptors,
} from '../../../cypress/support/interceptors';
import InventoryGroupDetail from './InventoryGroupDetail';

const TAB_CONTENT = '[data-ouia-component-type="PF4/TabContent"]'; // TODO: move to FEC
const TAB_BUTTON = '[data-ouia-component-type="PF4/TabButton"]'; // TODO: move to FEC
const TEST_GROUP_ID = '620f9ae75A8F6b83d78F3B55Af1c4b2C';

const mountPage = () =>
  cy.mountWithContext(InventoryGroupDetail, undefined, {
    groupId: TEST_GROUP_ID,
  });

before(() => {
  cy.mockWindowChrome(); // with all permissions
});

describe('test data', () => {
  it('the group has no hosts', () => {
    groupDetailFixtures.results[0].host_count === 0;
  });
});

describe('group detail page', () => {
  it('name from server is rendered in header and breadcrumb', () => {
    groupDetailInterceptors.successful();
    mountPage();

    cy.wait('@getGroupDetail');
    cy.get('h1').contains(groupDetailFixtures.results[0].name);
    cy.get('[data-ouia-component-type="PF4/Breadcrumb"] li')
      .last()
      .should('have.text', groupDetailFixtures.results[0].name);
  });

  it('skeletons rendered while fetching data', () => {
    groupDetailInterceptors['long responding']();
    mountPage();

    cy.get('[data-ouia-component-type="PF4/Breadcrumb"] li')
      .last()
      .find('.pf-c-skeleton');
    cy.get('h1').find('.pf-c-skeleton');
    cy.get('.pf-c-empty-state').find('.pf-c-spinner');
  });

  it('can rename group', () => {
    groupsInterceptors['successful with some items'](); // intercept modal validation requests
    groupDetailInterceptors.successful();
    groupDetailInterceptors['patch successful']();
    mountPage();

    cy.ouiaId('group-actions-dropdown-toggle').should('be.enabled').click();
    cy.get(DROPDOWN_ITEM).contains('Rename').click();

    cy.get(MODAL).find('input').type('1');
    cy.get(MODAL).find('button[type=submit]').click();

    cy.wait('@patchGroup')
      .its('request.body')
      .should('deep.equal', {
        name: `${groupDetailFixtures.results[0].name}1`,
      });
    cy.wait('@getGroupDetail'); // the page is refreshed after submition
  });

  it('can delete an empty group', () => {
    groupDetailInterceptors.successful();
    groupDetailInterceptors['delete successful']();
    mountPage();

    cy.ouiaId('group-actions-dropdown-toggle').should('be.enabled').click();
    cy.get(DROPDOWN_ITEM).contains('Delete').click();

    cy.get(`div[class="pf-c-check"]`).click();
    cy.get(`button[type="submit"]`).click();
    cy.wait('@deleteGroup')
      .its('request.url')
      .should('contain', groupDetailFixtures.results[0].id);
  });
});

describe('integration with rbac', () => {
  describe('no permissions', () => {
    before(() => {
      cy.mockWindowChrome({ userPermissions: [] });
    });

    beforeEach(() => {
      groupDetailInterceptors.successful();
      mountPage();
    });

    it('should render only id in header and breadcrumb', () => {
      cy.get('h1').contains(groupDetailFixtures.results[0].id);
      cy.get('[data-ouia-component-type="PF4/Breadcrumb"] li')
        .last()
        .should('have.text', groupDetailFixtures.results[0].id);
    });

    it('should not see any tabs', () => {
      cy.get(TAB_CONTENT).should('not.exist');
      cy.get(TAB_BUTTON).should('not.exist');
    });

    it('empty state is rendered', () => {
      cy.get('h5').should(
        'have.text',
        'Inventory group access permissions needed'
      );
    });

    it('actions are disabled', () => {
      cy.get(DROPDOWN).contains('Group actions').should('be.disabled');
    });

    it('should show group id', () => {
      cy.get('h1').should('have.text', TEST_GROUP_ID);
    });
  });

  describe('only groups read permissions', () => {
    before(() => {
      cy.mockWindowChrome({
        userPermissions: [
          {
            permission: 'inventory:groups:read',
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

    beforeEach(() => {
      groupDetailInterceptors.successful();
      mountPage();
    });

    it('actions are disabled', () => {
      cy.get(DROPDOWN).contains('Group actions').should('be.disabled');
    });

    it('should not allow to see systems', () => {
      cy.get(TAB_CONTENT)
        .find('h5')
        .should('have.text', 'Access needed for systems in this group');
    });

    it('should allow to see the group info tab', () => {
      cy.get(TAB_BUTTON).contains('Group info').click();
      cy.get(TAB_CONTENT)
        .eq(1) // <- workaround since PF renders both tab contents and hides the first
        .find('.pf-c-card__title') // TODO: tie to OUIA
        .should('have.text', 'User access configuration');
    });

    it('should fetch and display group name instead id', () => {
      cy.wait('@getGroupDetail');
      cy.get('h1').should('have.text', groupDetailFixtures.results[0].name);
    });
  });

  describe('only group read and hosts read permission', () => {
    before(() => {
      cy.mockWindowChrome({
        userPermissions: [
          'inventory:hosts:read',
          {
            permission: 'inventory:groups:read',
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

    beforeEach(() => {
      groupDetailInterceptors.successful();
      mountPage();
    });

    it('actions are disabled', () => {
      cy.get(DROPDOWN).contains('Group actions').should('be.disabled');
    });

    it('should allow to see systems', () => {
      cy.get(TAB_CONTENT).find('h4').should('have.text', 'No systems added');
    });

    it('should fetch and display group name instead id', () => {
      cy.wait('@getGroupDetail');
      cy.get('h1').should('have.text', groupDetailFixtures.results[0].name);
    });
  });
});
