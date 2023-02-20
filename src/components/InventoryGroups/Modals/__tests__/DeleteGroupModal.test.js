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
                    <DeleteGroupModal
                        isModalOpen={true}
                        reloadData={() => console.log('data reloaded')}
                        modalState={{ id: 1, name: 'test name' }}
                    />
                </Provider>
            </MemoryRouter>
        );
        expect(screen.getByRole('heading', { name: /Delete group/ })).toBeInTheDocument();
        expect(screen.getByText((content) => content.startsWith('test name'))).toBeInTheDocument();
        // eslint-disable-next-line max-len
        expect(screen.getByText((content) => content.startsWith('and all its data will be permanently deleted. Associated systems will be removed from the group but will not be deleted.')))
        .toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Delete/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
    });
});
