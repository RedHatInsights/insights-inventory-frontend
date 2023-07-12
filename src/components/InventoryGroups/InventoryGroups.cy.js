import { groupsInterceptors as interceptors } from '../../../cypress/support/interceptors';
import InventoryGroups from './InventoryGroups';

const mountPage = () => cy.mountWithContext(InventoryGroups);

before(() => {
  cy.mockWindowChrome();
});

describe('groups table page', () => {
  it('renders table if there is at least one group', () => {
    interceptors['successful with some items']();
    mountPage();
    cy.wait('@getGroups');

    cy.get('#groups-table');
  });

  it('renders only empty state when there are no groups', () => {
    interceptors['successful empty']();
    mountPage();
    cy.wait('@getGroups');

    cy.get('#groups-table').should('not.exist');
    cy.get('.pf-c-empty-state').find('h4').contains('Create a system group');
  });

  it('renders error message when request fails', () => {
    interceptors['failed with server error']();
    mountPage();
    cy.wait('@getGroups');

    cy.get('#groups-table').should('not.exist');
    cy.get('.pf-c-empty-state').find('h4').contains('Something went wrong');
  });

  it('renders spinner when loading', () => {
    interceptors['long responding']();
    mountPage();

    cy.get('[role=progressbar]').should('have.class', 'pf-c-spinner pf-m-xl');
  });

  describe('integration with rbac', () => {
    it('disables empty state button when not enough permissions', () => {
      interceptors['successful empty']();
      cy.mockWindowChrome({ userPermissions: [] });
      mountPage();

      cy.get('button')
        .contains('Create group')
        .should('have.attr', 'aria-disabled', 'true');
    });
  });
});
