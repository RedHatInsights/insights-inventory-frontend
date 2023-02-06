import React from 'react';
import { mount } from '@cypress/react';
import CreateGroupModal from './CreateGroupModal';
import { ouiaId } from '@redhat-cloud-services/frontend-components-utilities';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { getStore } from '../../../store';

const MODAL = ouiaId('group-modal');

describe('render Create Group Modal', () => {
    beforeEach(() => {
        mount(
            <MemoryRouter>
                <Provider store={getStore()}>
                    <CreateGroupModal />
                </Provider>
            </MemoryRouter>
        );
    });

    it('exits', () => {
        cy.get(MODAL).should('exist');
    });
});
