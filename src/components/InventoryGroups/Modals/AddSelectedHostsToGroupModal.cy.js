import {
  groupsInterceptors,
  systemProfileInterceptors,
} from '../../../../cypress/support/interceptors';
import AddSelectedHostsToGroupModal from './AddSelectedHostsToGroupModal';

const mountModal = (
  props = {
    isModalOpen: true,
    setIsModalOpen: () => {},
    modalState: [
      {
        display_name: 'host1',
        id: 'host1-id',
      },
    ],
    reloadData: () => {},
  },
) => {
  cy.mountWithContext(AddSelectedHostsToGroupModal, {}, props);
};

describe('AddSelectedHostsToGroupModal', () => {
  describe('without any permissions', () => {
    before(() => {
      cy.mockWindowInsights({
        userPermissions: [],
      });
    });

    beforeEach(() => {
      groupsInterceptors['successful with some items']();
      systemProfileInterceptors['operating system, successful empty']();
      mountModal();
    });

    it('create workspace button is hidden', () => {
      cy.get('button').contains('Create a new workspace').should('not.exist');
    });
  });

  describe('with limited groups write permissions', () => {
    it('should still hide the create workspace button', () => {
      cy.mockWindowInsights({
        userPermissions: [
          {
            resourceDefinitions: [
              {
                attributeFilter: {
                  key: 'group.id',
                  value: ['74d41845-9939-428d-933e-1bcffe141219'],
                  operation: 'in',
                },
              },
            ],
            permission: 'inventory:groups:write',
          },
        ],
      });

      mountModal();
      cy.get('button').contains('Create a new workspace').should('not.exist');
    });
  });

  describe('with groups write permission', () => {
    before(() => {
      cy.mockWindowInsights({
        userPermissions: ['inventory:groups:write'],
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

    it('create workspace button is visible', () => {
      cy.get('button').contains('Create a new workspace').should('exist');
      cy.get('button')
        .contains('Create a new workspace')
        .shouldHaveAriaEnabled();
    });
  });
});
