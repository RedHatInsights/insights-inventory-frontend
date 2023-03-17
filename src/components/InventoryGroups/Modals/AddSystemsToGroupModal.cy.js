import { mount } from '@cypress/react';
import FlagProvider from '@unleash/proxy-client-react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import {
    featureFlagsInterceptors,
    groupsInterceptors,
    hostsInterceptors,
    systemProfileInterceptors
} from '../../../../cypress/support/interceptors';
import { unleashDummyConfig } from '../../../../cypress/support/utils';
import { getStore } from '../../../store';
import AddSystemsToGroupModal from './AddSystemsToGroupModal';

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

describe('AddSystemsToGroupModal', () => {
    it('renders', () => {
        hostsInterceptors.successful();
        featureFlagsInterceptors.successful();
        systemProfileInterceptors['operating system, successful empty']();
        groupsInterceptors['successful with some items']();

        mount(
            <FlagProvider config={unleashDummyConfig}>
                <Provider store={getStore()}>
                    <MemoryRouter>
                        <AddSystemsToGroupModal isModalOpen={true} />
                    </MemoryRouter>
                </Provider>
            </FlagProvider>
        );
    });
});
