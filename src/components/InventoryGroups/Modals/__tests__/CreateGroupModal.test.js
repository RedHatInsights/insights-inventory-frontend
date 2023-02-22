import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getStore } from '../../../../store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import CreateGroupModal from '../CreateGroupModal';

describe('CreateGroupModal', () => {
    it('renders correctly', () => {
        render(
            <MemoryRouter>
                <Provider store={getStore()}>
                    <CreateGroupModal isModalOpen={true} reloadData={() => console.log('data reloaded')}/>
                </Provider>
            </MemoryRouter>
        );
        expect(screen.getByRole('heading', { name: /Create group/ })).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Create/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
    });
});
