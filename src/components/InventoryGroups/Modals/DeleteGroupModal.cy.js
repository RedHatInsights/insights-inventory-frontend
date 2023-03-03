/* eslint-disable camelcase */
import React from 'react';
import { mount } from '@cypress/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { getStore } from '../../../store';
import DeleteGroupModal from './DeleteGroupModal';
import { deleteGroupsInterceptors } from '../../../../cypress/support/interceptors';

const mountModal = (props) =>
    mount(
        <MemoryRouter>
            <Provider store={getStore()}>
                <DeleteGroupModal {...props} />
            </Provider>
        </MemoryRouter>
    );

describe('Delete Group Modal', () => {
    before(() => {
        cy.window().then(window => window.insights = {
            chrome: {
                isProd: false,
                auth: {
                    getUser: () => {
                        return Promise.resolve({});
                    }
                }
            }
        });
    });

    beforeEach(() => {
        deleteGroupsInterceptors['successful deletion']();
    });

    it('fires a network request, single group', () => {
        const id = 'foo-bar-1';
        const name = 'foobar group';

        mountModal({
            isModalOpen: true,
            modalState: {
                id,
                name
            }
        });

        cy.get(`div[class="pf-c-check"]`).click();
        cy.get(`button[type="submit"]`).click();
        cy.wait('@deleteGroups').its('request.url').should('include', 'foo-bar-1');
    });

    it('fires a network request, more groups', () => {
        const ids = ['foo-bar-1', 'foo-bar-2'];

        mountModal({
            isModalOpen: true,
            modalState: {
                ids
            }
        });

        cy.get(`div[class="pf-c-check"]`).click();
        cy.get(`button[type="submit"]`).click();
        cy.wait('@deleteGroups').its('request.url').should('include', 'foo-bar-1').and('include', 'foo-bar-2');
    });
});
