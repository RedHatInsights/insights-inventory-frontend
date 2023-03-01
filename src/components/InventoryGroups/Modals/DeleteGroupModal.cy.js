/* eslint-disable camelcase */
import React from 'react';
import { mount } from '@cypress/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { getStore } from '../../../store';
import DeleteGroupModal from './DeleteGroupModal';

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
        cy.intercept('DELETE', '**/api/inventory/v1/groups/1', {
            statusCode: 200, body: {
            }
        }).as('delete');

        mount(
            <MemoryRouter>
                <Provider store={getStore()}>
                    <DeleteGroupModal isModalOpen={true} modalState={ { id: 1, name: 'test name' } }/>
                </Provider>
            </MemoryRouter>
        );
    });

    it('Input is fillable and firing a delete request', () => {
        cy.get(`div[class="pf-c-check"]`).click();
        cy.get(`button[type="submit"]`).click();
        cy.wait('@delete');
    });
});
