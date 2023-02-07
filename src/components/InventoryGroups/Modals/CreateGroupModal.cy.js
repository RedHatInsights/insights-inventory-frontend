import React from 'react';
import { mount } from '@cypress/react';
import CreateGroupModal from './CreateGroupModal';
import {
    ouiaId,
    TEXT_INPUT
} from '@redhat-cloud-services/frontend-components-utilities';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { getStore } from '../../../store';

const MODAL = ouiaId('group-modal');

describe('render Create Group Modal', () => {
    beforeEach(() => {
        mount(
            <MemoryRouter>
                <Provider store={getStore()}>
                    <CreateGroupModal isOpen={true} reloadData={() => console.log('data reloaded')}/>
                </Provider>
            </MemoryRouter>
        );
    });
    it('Modal exist', () => {
        cy.get(MODAL).should('exist');
    });
    it('Input exist', () => {
        cy.get(TEXT_INPUT).should('exist');
    });

    it('Input is fillable and firing a validation request', () => {
        cy.get(TEXT_INPUT).type('query');
        cy.intercept('*', {
            statusCode: 201
        }).as('validate');
        cy.wait('@validate').then((xhr) => {
            expect(xhr.request.url).to.contain('groups/query');}
        );
    });

    it('Input is fillable and firing a create group', () => {
        cy.get(TEXT_INPUT).type('group_name');
        cy.get(`button[type="submit"]`).click();
        cy.intercept('*', {
            statusCode: 201
        }).as('create_group');
        cy.wait('@create_group').then((xhr) => {
            expect(xhr.request.url).to.contain('groups');}
        );
    });
});
