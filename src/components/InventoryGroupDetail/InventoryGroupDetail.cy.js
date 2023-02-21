import { mount } from '@cypress/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import groupDetailFixtures from '../../../cypress/fixtures/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C.json';
import { groupDetailInterceptors as interceptors } from '../../../cypress/support/interceptors';
import { getStore } from '../../store';
import InventoryGroupDetail from './InventoryGroupDetail';

const TEST_GROUP_ID = '620f9ae75A8F6b83d78F3B55Af1c4b2C';

const mountPage = () =>
    mount(
        <Provider store={getStore()}>
            <MemoryRouter>
                <InventoryGroupDetail groupId={TEST_GROUP_ID} />
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

describe('group detail page', () => {
    it('name from server is rendered in header and breadcrumb', () => {
        interceptors.successful();
        mountPage();

        cy.wait('@getGroupDetail');
        cy.get('h1').contains(groupDetailFixtures.results[0].name);
        cy.get('[data-ouia-component-type="PF4/Breadcrumb"] li')
        .last()
        .should('have.text', groupDetailFixtures.results[0].name);
    });

    it('skeletons rendered while fetching data', () => {
        interceptors['long responding']();
        mountPage();

        cy.get('[data-ouia-component-type="PF4/Breadcrumb"] li').last().find('.pf-c-skeleton');
        cy.get('h1').find('.pf-c-skeleton');
        cy.get('.pf-c-empty-state').find('.pf-c-spinner');
    });
});
