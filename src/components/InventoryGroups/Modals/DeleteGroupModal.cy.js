/* eslint-disable camelcase */
import { CHECKBOX } from '@redhat-cloud-services/frontend-components-utilities';
import _ from 'lodash';
import groupsFixtures from '../../../../cypress/fixtures/groups.json';
import { deleteGroupsInterceptors, groupsInterceptors } from '../../../../cypress/support/interceptors';
import DeleteGroupModal from './DeleteGroupModal';

const mountModal = (props) => cy.mountWithContext(DeleteGroupModal, undefined, props);

const GROUPS = [{ id: '1', name: 'group-1-name' }, { id: '2', name: 'group-2-name' }];

const fixtures = _.cloneDeep(groupsFixtures);
fixtures.results = [
    {
        updated_at: '2017-11-13T00:00:00.0Z',
        id: GROUPS[0].id,
        created_at: '1991-03-22T23:00:00.0Z',
        name: GROUPS[0].name,
        host_count: 0
    },
    {
        id: GROUPS[1].id,
        name: GROUPS[1].name,
        updated_at: '1978-11-13T00:00:00.0Z',
        created_at: '1966-12-21T00:00:00.0Z',
        host_count: 0
    }
];

describe('Delete Group Modal', () => {
    before(() => {
        cy.mockWindowChrome();
    });

    describe('multiple hosts', () => {
        beforeEach(() => {
            groupsInterceptors['successful with some items'](fixtures);
            deleteGroupsInterceptors['successful deletion']();

            const setIsModalOpen = cy.stub().as('setIsModalOpen');
            const reloadData = cy.stub().as('reloadData');

            mountModal({
                isModalOpen: true,
                setIsModalOpen,
                reloadData,
                groupIds: GROUPS.map(({ id }) => id)
            });

            cy.wait('@getGroups');
        });

        it('can close the modal with the cross button', () => {
            cy.get('[data-ouia-component-id="group-modal-ModalBoxCloseButton"]').click();
            cy.get('@setIsModalOpen').should('be.calledOnce');
        });

        it('can close the modal with Cancel', () => {
            cy.get('button').contains('Cancel').click();
            cy.get('@setIsModalOpen').should('be.calledOnce');
        });

        describe('with all groups empty of hosts', () => {
            it('renders correct content', () => {
                cy.get('h1').should('have.text', 'Delete groups?');
                cy.get('p').should('have.text', `${GROUPS.length} groups and all their data will be deleted.`);
            });

            it('user can delete after checking the warning', () => {
                cy.get('button').contains('Delete').should('be.disabled');
                cy.get(CHECKBOX).click();
                cy.get('button').contains('Delete').should('be.enabled').click();
                cy.wait('@deleteGroups');
                // check that modal calls functions after completion
                cy.get('@setIsModalOpen').should('be.calledOnce');
                cy.get('@reloadData').should('be.calledOnce');
            });
        });

        describe('with some groups having hosts', () => {
            beforeEach(() => {
                const fixturesNonZeroHosts = _.cloneDeep(fixtures);
                fixturesNonZeroHosts.results[0].host_count = 1;
                groupsInterceptors['successful with some items'](fixturesNonZeroHosts);

                const setIsModalOpen = cy.stub().as('setIsModalOpen');
                const reloadData = cy.stub().as('reloadData');

                mountModal({
                    isModalOpen: true,
                    setIsModalOpen,
                    reloadData,
                    groupIds: GROUPS.map(({ id }) => id)
                });

                cy.wait('@getGroups');
            });

            it('renders correct content', () => {
                cy.get('h1').should('have.text', 'Cannot delete groups at this time');
                cy.get('p').should('contain.text', 'Groups containing systems cannot be deleted.');
            });

            it('user can get back', () => {
                cy.get('button').contains('Delete').should('not.exist');
                cy.get('button').contains('Close').click();
                cy.get('@setIsModalOpen').should('be.called');
            });
        });
    });

    describe('single group', () => {
        beforeEach(() => {
            const fixturesSingleGroup = _.cloneDeep(fixtures);
            fixturesSingleGroup.results = [fixturesSingleGroup.results[0]];
            groupsInterceptors['successful with some items'](fixturesSingleGroup);
            deleteGroupsInterceptors['successful deletion']();

            const setIsModalOpen = cy.stub().as('setIsModalOpen');
            const reloadData = cy.stub().as('reloadData');

            mountModal({
                isModalOpen: true,
                setIsModalOpen,
                reloadData,
                groupIds: GROUPS.slice(0, 1).map(({ id }) => id)
            });

            cy.wait('@getGroups');
        });

        it('renders correct content', () => {
            cy.get('h1').should('have.text', 'Delete group?');
            cy.get('p').should('contain.text', `${GROUPS[0].name} and all its data will be deleted.`);
        });

        it('user can delete after checking the warning', () => {
            cy.get('button').contains('Delete').should('be.disabled');
            cy.get(CHECKBOX).click();
            cy.get('button').contains('Delete').should('be.enabled').click();
            cy.wait('@deleteGroups');
            // check that modal calls functions after completion
            cy.get('@setIsModalOpen').should('be.calledOnce');
            cy.get('@reloadData').should('be.calledOnce');
        });
    });
});
