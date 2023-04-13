import { mount } from '@cypress/react';
import {
    checkTableHeaders,
    DROPDOWN_ITEM,
    MODAL,
    ouiaId,
    TABLE
} from '@redhat-cloud-services/frontend-components-utilities';
import FlagProvider from '@unleash/proxy-client-react';
import _ from 'lodash';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import {
    featureFlagsInterceptors,
    groupDetailInterceptors,
    hostsFixtures,
    hostsInterceptors
} from '../../../../cypress/support/interceptors';
import {
    selectRowN,
    unleashDummyConfig
} from '../../../../cypress/support/utils';
import { getStore } from '../../../store';
import AddSystemsToGroupModal from './AddSystemsToGroupModal';

const TABLE_HEADERS = [
    'Name',
    'Group',
    'Tags',
    'OS',
    'Update method',
    'Last seen'
];

const AVAILABLE_FILTER_NAMES = [
    'Name',
    'Status',
    'Operating System',
    'Data Collector',
    'RHC status',
    'Last seen',
    'Group',
    'Tags'
];

const ALERT = '[data-ouia-component-type="PF4/Alert"]';

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

const mountModal = () =>
    mount(
        <FlagProvider config={unleashDummyConfig}>
            <Provider store={getStore()}>
                <MemoryRouter>
                    <AddSystemsToGroupModal
                        isModalOpen={true}
                        groupId="620f9ae75A8F6b83d78F3B55Af1c4b2C"
                        setIsModalOpen={() => {}} // TODO: test that the func is called on close
                    />
                </MemoryRouter>
            </Provider>
        </FlagProvider>
    );

describe('test data', () => {
    it('at least one system is already in a group', () => {
        const alreadyInGroup = hostsFixtures.results.filter(
            // eslint-disable-next-line camelcase
            ({ group_name }) => !_.isEmpty(group_name)
        );
        expect(alreadyInGroup.length).to.be.gte(1);
    });

    it('the first system in group has specific id', () => {
        const alreadyInGroup = hostsFixtures.results.filter(
            // eslint-disable-next-line camelcase
            ({ group_name }) => !_.isEmpty(group_name)
        );
        expect(alreadyInGroup[0].id).to.eq('anim commodo');
    });
});

describe('AddSystemsToGroupModal', () => {
    beforeEach(() => {
        cy.viewport(1920, 1080); // to accomadate the inventory table
        cy.intercept('*', { statusCode: 200 });
        hostsInterceptors.successful(); // default hosts list
        featureFlagsInterceptors.successful(); // to enable the Group column
    });

    it('renders correct header and buttons', () => {
        mountModal();

        cy.wait('@getHosts');
        cy.get('h1').contains('Add systems');
        cy.get('button').contains('Add systems');
        cy.get('button').contains('Cancel');
    });

    it('renders the inventory table', () => {
        mountModal();

        cy.wait('@getHosts');
        cy.get(ouiaId('PrimaryToolbar'));
        cy.get(TABLE);
        cy.get('#options-menu-bottom-pagination');
        checkTableHeaders(TABLE_HEADERS);
    });

    it('can add systems that are not yet in group', () => {
        groupDetailInterceptors['patch successful']();
        groupDetailInterceptors['successful with hosts']();
        mountModal();

        cy.get('table[aria-label="Host inventory"]').should('have.attr', 'data-ouia-safe', 'true');
        cy.get('button').contains('Add systems').should('be.disabled');
        selectRowN(1);
        cy.get('button').contains('Add systems').click();
        cy.wait('@getGroupDetail'); // requests the current hosts list
        cy.wait('@patchGroup')
        .its('request.body')
        .should('deep.equal', {
            // eslint-disable-next-line camelcase
            host_ids: ['host-1', 'host-2', 'dolor'] // sends the merged list of hosts
        });
    });

    it('can add systems that are already in group', () => {
        groupDetailInterceptors['patch successful']();
        groupDetailInterceptors['successful with hosts']();
        mountModal();

        cy.get('table[aria-label="Host inventory"]').should('have.attr', 'data-ouia-safe', 'true');
        const i =
      hostsFixtures.results.findIndex(
          // eslint-disable-next-line camelcase
          ({ group_name }) => !_.isEmpty(group_name)
      ) + 1;
        selectRowN(i);
        cy.get(ALERT); // check the alert is shown
        cy.get('button').contains('Add systems').click();
        cy.get(MODAL).find('h1').contains('Add all selected systems to group?');
        cy.get('button')
        .contains('Yes, add all systems to group')
        .should('be.disabled');
        cy.get('input[name="confirmation"]').check();
        cy.get('button').contains('Yes, add all systems to group').click();
        cy.wait('@getGroupDetail');
        cy.wait('@patchGroup')
        .its('request.body')
        .should('deep.equal', {
            // eslint-disable-next-line camelcase
            host_ids: ['host-1', 'host-2', 'anim commodo'] // sends the merged list of hosts
        });
    });

    describe('filters', () => {
        it('has correct list of filters', () => {
            groupDetailInterceptors['successful with hosts']();
            mountModal();

            cy.wait('@getHosts');
            cy.get('button[data-ouia-component-id="ConditionalFilter"]').click();
            cy.get(DROPDOWN_ITEM).each(($item, i) => {
                expect($item.text()).to.equal(AVAILABLE_FILTER_NAMES[i]);
            });
        });
    });
});
