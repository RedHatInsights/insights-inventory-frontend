/* eslint-disable camelcase */
import React from 'react';
import { mount } from '@cypress/react';
import RenameGroupModal from './RenameGroupModal';
import {
    TEXT_INPUT
} from '@redhat-cloud-services/frontend-components-utilities';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { getStore } from '../../../store';
import groups from '../../../../cypress/fixtures/groups.json';

const mockResponse = [groups];

describe('render Rename Group Modal', () => {
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
        cy.intercept('GET', '**/api/inventory/v1/groups', {
            statusCode: 200, body: {
                ...mockResponse[0]
            }
        }).as('validate');
        cy.intercept('PATCH', '**/api/inventory/v1/groups/1', {
            statusCode: 200, body: {
                ...mockResponse[0]
            }
        }).as('rename');

    });

    it('Input is fillable and firing a validation request that succeeds', () => {
        mount(
            <MemoryRouter>
                <Provider store={getStore()}>
                    <RenameGroupModal
                        isModalOpen={true}
                        reloadData={() => console.log('data reloaded')}
                        modalState={{ id: '1', name: 'Ut occaeca' }}
                    />
                </Provider>
            </MemoryRouter>
        );
        cy.get(TEXT_INPUT).type('t');
        cy.wait('@validate').then((xhr) => {
            expect(xhr.request.url).to.contain('groups');}
        );
        cy.get(`button[type="submit"]`).should('have.attr', 'aria-disabled', 'true');
    });

    it('User can rename the group', () => {
        mount(
            <MemoryRouter>
                <Provider store={getStore()}>
                    <RenameGroupModal
                        isModalOpen={true}
                        reloadData={() => console.log('data reloaded')}
                        modalState={{ id: '1', name: 'sre-group' }}
                    />
                </Provider>
            </MemoryRouter>
        );
        cy.get(TEXT_INPUT).type('newname');
        cy.get(`button[type="submit"]`).should('have.attr', 'aria-disabled', 'false');
        cy.get(`button[type="submit"]`).click();
        cy.wait('@rename');
    });
});
