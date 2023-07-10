import { groupsInterceptors } from '../../../../cypress/support/interceptors';
import AddSelectedHostsToGroupModal from './AddSelectedHostsToGroupModal';

const mountModal = (
  props = {
    isModalOpen: true,
    setIsModalOpen: () => {},
    modalState: [
      {
        // eslint-disable-next-line camelcase
        display_name: 'host1',
        id: 'host1-id',
      },
    ],
    reloadData: () => {},
  }
) => {
  cy.mountWithContext(AddSelectedHostsToGroupModal, {}, props);
};

describe('AddSelectedHostsToGroupModal', () => {
  describe('without any permissions', () => {
    before(() => {
      cy.mockWindowChrome({
        userPermissions: [],
      });
    });

    beforeEach(() => {
      groupsInterceptors['successful with some items']();
      mountModal();
    });

    it('makes separate requests when searching groups', () => {
      cy.wait('@getGroups'); // must make initial call
      cy.get('input').type('abc');
      cy.wait('@getGroups').its('request.url').should('contain', '?name=abc');
      cy.get('input').type('d');
      cy.wait('@getGroups').its('request.url').should('contain', '?name=abcd');
    });

    it('create group button is disabled', () => {
      cy.get('button')
        .contains('Create a new group')
        .should('have.attr', 'aria-disabled', 'true');
    });
  });

  describe('with groups write permission', () => {
    before(() => {
      cy.mockWindowChrome({
        userPermissions: ['inventory:groups:write'],
      });
    });

    beforeEach(() => {
      groupsInterceptors['successful with some items']();
      mountModal();
    });

    it('create group button is enabled', () => {
      cy.get('button')
        .contains('Create a new group')
        .not('have.attr', 'aria-disabled', 'true');
    });
  });
});
