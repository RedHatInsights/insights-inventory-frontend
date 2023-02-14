import React from 'react';
import { mount } from '@cypress/react';
import CreateGroupModal from './CreateGroupModal';
import {
    TEXT_INPUT
} from '@redhat-cloud-services/frontend-components-utilities';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { getStore } from '../../../store';

describe('render Create Group Modal', () => {
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

        cy.intercept('POST', '**/api/inventory/v1/groups', {
            statusCode: 504
        }).as('create_group');
        cy.intercept('GET', '**/api/inventory/v1/groups', {
            statusCode: 200
        }).as('validate');

        mount(
            <MemoryRouter>
                <Provider store={getStore()}>
                    <CreateGroupModal isOpen={true} reloadData={() => console.log('data reloaded')}/>
                </Provider>
            </MemoryRouter>
        );
    });

    it('Input is fillable and firing a validation request that succeeds', () => {
        cy.get(TEXT_INPUT).type('sre-group0');
        cy.wait('@validate').then((xhr) => {
            expect(xhr.request.url).to.contain('groups');}
        );
        cy.get(`button[type="submit"]`).should('have.attr', 'aria-disabled', 'false');
    });
});
