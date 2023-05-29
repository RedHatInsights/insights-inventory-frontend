import { groupsInterceptors } from '../../../../cypress/support/interceptors';
import AddHostToGroupModal from './AddHostToGroupModal';

const mountModal = (props =
{
    isModalOpen: true,
    setIsModalOpen: () => {},
    modalState: {
        name: 'host1',
        id: 'host1-id'
    },
    reloadData: () => {}
}) => {
    cy.mountWithContext(AddHostToGroupModal, {}, props);
};

before(() => {
    cy.mockWindowChrome();
});

describe('AddHostToGroupModal', () => {
    it('makes separate requests when searching groups', () => {
        groupsInterceptors['successful with some items']();
        mountModal();

        cy.wait('@getGroups'); // must make initial call
        cy.get('input').type('abc');
        cy.wait('@getGroups').its('request.url').should('contain', '?name=abc');
        cy.get('input').type('d');
        cy.wait('@getGroups').its('request.url').should('contain', '?name=abcd');
    });
});
