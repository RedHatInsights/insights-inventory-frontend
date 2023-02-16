import { mount } from '@cypress/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { groupsInterceptors as interceptors } from '../../../cypress/support/interceptors';
import { getStore } from '../../store';
import InventoryGroups from './InventoryGroups';

const mountPage = () =>  mount(
    <Provider store={getStore()}>
        <MemoryRouter>
            <InventoryGroups />
        </MemoryRouter>
    </Provider>
);

before(() => {
    cy.window().then(
        (window) =>
            (window.insights = {
                chrome: {
                    isProd: false,
                    auth: {
                        getUser: () => {
                            return Promise.resolve({});
                        }
                    }
                }
            })
    );
});

describe('groups table page', () => {
    it('renders table if there is at least one group', () => {
        interceptors['successful with some items']();
        mountPage();

        cy.get('h1').contains('Groups');
        cy.get('#groups-table');
    });

    it('renders only empty state when there are no groups', () => {
        interceptors['successful empty']();
        mountPage();

        cy.get('h1').contains('Groups');
        cy.get('#groups-table').should('not.exist');
        cy.get('.pf-c-empty-state').find('h4').contains('Create a system group');
    });

    it('renders error message when request fails', () => {
        interceptors['failed with server error']();
        mountPage();

        cy.get('h1').contains('Groups');
        cy.get('#groups-table').should('not.exist');
        cy.get('.pf-c-empty-state').find('h4').contains('Something went wrong');
    });

    it('renders spinner when loading', () => {
        interceptors['long responding']();
        mountPage();

        cy.get('[role=progressbar]').should('have.class', 'pf-c-spinner pf-m-xl');
    });
});
