import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import InventoryGroupDetail from '../InventoryGroupDetail';

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
        }),
        useDispatch: () => () => {}
    };
});

describe('group detail page component', () => {
    let getByRole;
    let container;

    beforeEach(() => {
        const rendered = render(
            <MemoryRouter>
                <InventoryGroupDetail groupId="group-id-2" />
            </MemoryRouter>
        );
        getByRole = rendered.getByRole;
        container = rendered.container;
    });

    it('renders two tabs', () => {
        expect(getByRole('tablist')).toBeInTheDocument();
        expect(container.querySelectorAll('.pf-c-tabs__item')[0]).toHaveTextContent('Systems');
        expect(container.querySelectorAll('.pf-c-tabs__item')[1]).toHaveTextContent('Group info');
    });
});
