import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getStore } from '../../../../store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import DeleteGroupModal from '../DeleteGroupModal';

describe('DeleteGroupModal', () => {
    it('renders correctly', () => {
        render(
            <MemoryRouter>
                <Provider store={getStore()}>
                    <DeleteGroupModal isModalOpen={true} reloadData={() => console.log('data reloaded')}/>
                </Provider>
            </MemoryRouter>
        );
        expect(screen.getByRole('heading', { name: /Delete group/ })).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Delete/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
    });
});
