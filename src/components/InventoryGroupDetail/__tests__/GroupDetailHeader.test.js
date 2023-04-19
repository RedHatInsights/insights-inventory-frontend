import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import GroupDetailHeader from '../GroupDetailHeader';

jest.mock('react-redux', () => {
    return {
        ...jest.requireActual('react-redux'),
        useSelector: () => ({
            uninitialized: false,
            loading: false,
            data: {
                results: [
                    {
                        name: 'group-name-1'
                    }
                ]
            }
        })
    };
});

describe('group detail header', () => {
    let getByRole;

    beforeEach(() => {
        const rendered = render(
            <MemoryRouter>
                <GroupDetailHeader groupId="group-id-2" />
            </MemoryRouter>
        );
        getByRole = rendered.getByRole;
    });

    it('renders title and breadcrumbs', () => {
        expect(getByRole('heading')).toBeInTheDocument();
    });

    it('has breadcrumbs', () => {
        expect(getByRole('navigation')).toHaveClass('pf-c-breadcrumb');
        expect(getByRole('navigation')).toHaveTextContent('group-name-1');
    });
});
