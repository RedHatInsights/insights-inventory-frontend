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

const mockResponse = [
    {
        count: 50,
        page: 20,
        per_page: 20,
        total: 50,
        results: [
            {
                created_at: '2020-02-09T10:16:07.996Z',
                host_ids: ['bA6deCFc19564430AB814bf8F70E8cEf'],
                id: '3f01b55457674041b75e41829bcee1dca',
                name: 'sre-group0',
                updated_at: '2020-02-09T10:16:07.996Z'
            },
            {
                created_at: '2020-02-09T10:16:07.996Z',
                host_ids: ['bA6deCFc19564430AB814bf8F70E8cEf'],
                id: '3f01b55457674041b75e41829bcee1dca',
                name: 'sre-group1',
                updated_at: '2020-02-09T10:16:07.996Z'
            },
            {
                created_at: '2020-02-09T10:16:07.996Z',
                host_ids: ['bA6deCFc19564430AB814bf8F70E8cEf'],
                id: '3f01b55457674041b75e41829bcee1dca',
                name: 'sre-group2',
                updated_at: '2020-02-09T10:16:07.996Z'
            },
            {
                created_at: '2020-02-09T10:16:07.996Z',
                host_ids: ['bA6deCFc19564430AB814bf8F70E8cEf'],
                id: '3f01b55457674041b75e41829bcee1dca',
                name: 'sre-group3',
                updated_at: '2020-02-09T10:16:07.996Z'
            }
        ]
    }
];

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
    });

    it('Input is fillable and firing a validation request that succeeds', () => {
        cy.get(TEXT_INPUT).type('0');
        cy.wait('@validate').then((xhr) => {
            expect(xhr.request.url).to.contain('groups');}
        );
        cy.get(`button[type="submit"]`).should('have.attr', 'aria-disabled', 'true');
    });

    it('User can rename the group', () => {
        cy.get(TEXT_INPUT).type('newname');
        cy.get(`button[type="submit"]`).should('have.attr', 'aria-disabled', 'false');
        cy.get(`button[type="submit"]`).click();
        cy.wait('@rename');
    });
});
