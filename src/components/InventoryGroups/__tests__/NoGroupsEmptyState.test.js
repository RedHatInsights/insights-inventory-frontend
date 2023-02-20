import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getStore } from '../../../store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import NoGroupsEmptyState from '../NoGroupsEmptyState';

describe('NoGroupsEmptyState', () => {
    it('renders title and icon', () => {
        const { getByRole, container } = render(
            <MemoryRouter>
                <Provider store={getStore()}>
                    <NoGroupsEmptyState />
                </Provider>
            </MemoryRouter>);
        // toHaveTextContent is a part of @testing-library/jest-dom
        expect(getByRole('heading')).toHaveTextContent('Create a system group');
        expect(container.querySelector('.pf-c-empty-state__icon')).not.toBe(null);
    });

    it('has primary and link buttons', () => {
        const { container } = render(
            <MemoryRouter>
                <Provider store={getStore()}>
                    <NoGroupsEmptyState />
                </Provider>
            </MemoryRouter>);
        expect(container.querySelector('.pf-m-primary')).toHaveTextContent(
            'Create group'
        );
        const link = container.querySelector('.pf-m-link');
        expect(link).toHaveTextContent('Learn more about system groups');
        // TODO: expect(link).toHaveAttribute('href', '');
    });
});
