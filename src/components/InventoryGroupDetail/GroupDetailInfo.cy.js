import { mount } from '@cypress/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { getStore } from '../../store';
import GroupDetailInfo from './GroupDetailInfo';

const mountPage = () =>
    mount(
        <Provider store={getStore()}>
            <MemoryRouter>
                <GroupDetailInfo />
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

describe('group detail information page', () => {
    it('Title is rendered', () => {
        mountPage();
        cy.get('div[class="pf-c-card__title pf-c-title pf-m-md card-title"]').should('have.text', 'User access configuration');
    });
    it('button is present', () => {
        mountPage();
        cy.get('button[class="pf-c-button pf-m-secondary pf-m-small"]').should('have.text', 'Manage access');
    });
    it('card text is present', () => {
        mountPage();
        cy.get('div[class="pf-c-card__body"]').should
        ('have.text', 'Manage your inventory group access configuration under Identity & Access Management > User Access.');
    });
});
