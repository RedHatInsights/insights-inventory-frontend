import { mount } from '@cypress/react';
import { DROPDOWN, DROPDOWN_ITEM, MODAL } from '@redhat-cloud-services/frontend-components-utilities';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import groupDetailFixtures from '../../../cypress/fixtures/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C.json';
import { groupDetailInterceptors as interceptors, groupsInterceptors } from '../../../cypress/support/interceptors';
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

    /*  TODO: fix this test (affected the execution of the next tests and made them flaky)
        it('skeletons rendered while fetching data', () => {
        // TODO: after each hook fails for some reason for this particular test
        Cypress.on('uncaught:exception', () => {
            return false;
        });

        interceptors['long responding']();
        mountPage();

        cy.get('[data-ouia-component-type="PF4/Breadcrumb"] li').last().find('.pf-c-skeleton');
        cy.get('h1').find('.pf-c-skeleton');
        cy.get('.pf-c-empty-state').find('.pf-c-spinner');
    });
    */

    it('can open rename group modal', () => {
        interceptors.successful();
        interceptors['patch successful']();
        groupsInterceptors['successful with some items'](); // intercept modal validation requests
        mountPage();

        cy.wait('@getGroupDetail');

        cy.get(DROPDOWN).click();
        cy.get(DROPDOWN_ITEM).contains('Rename').click();

        cy.get(MODAL).find('input').type('1');
        cy.get(MODAL).find('button[type=submit]').click();

        cy.wait('@patchGroup').its('request.body')
        .should('deep.equal', { name: `${groupDetailFixtures.results[0].name}1` });
        cy.wait('@getGroupDetail'); // the page is refreshed after submition
    });

    it('can open delete group modal', () => {
        interceptors.successful();
        interceptors['delete successful']();
        mountPage();
        cy.wait('@getGroupDetail');

        cy.get(DROPDOWN).click();
        cy.get(DROPDOWN_ITEM).contains('Delete').click();

        cy.get(`div[class="pf-c-check"]`).click();
        cy.get(`button[type="submit"]`).click();
        cy.wait('@deleteGroup').its('request.url')
        .should('contain', groupDetailFixtures.results[0].id);
    });
});
