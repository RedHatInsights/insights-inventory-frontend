import { mount } from '@cypress/react';
import React from 'react';
import { GroupDetailInfo } from './GroupDetailInfo';

const mountPage = (params) =>
    mount(
        <GroupDetailInfo {...params}/>
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
    it('title is rendered', () => {
        mountPage();
        cy.get('div[class="pf-c-card__title pf-c-title pf-m-lg card-title"]').should('have.text', 'User access configuration');
    });

    it('button is present', () => {
        mountPage();
        cy.get('button[class="pf-c-button pf-m-secondary"]').should('have.text', 'Manage access');
    });

    it('card text is present', () => {
        mountPage();
        cy.get('div[class="pf-c-card__body"]').should
        ('have.text', 'Manage your inventory group user access configuration under Identity & Access Management > User Access.');
    });

    describe('links', () => {
        it('in stable environment', () => {
            mountPage({ chrome: { isBeta: () => false } });
            cy.get('a').should('have.attr', 'href', '/iam/user-access');
        });

        it('in beta environment', () => {
            mountPage({ chrome: { isBeta: () => true } });
            cy.get('a').should('have.attr', 'href', '/beta/iam/user-access');
        });
    });
});
