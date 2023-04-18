import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { getStore } from '../../../store';
import InventoryGroupDetail from '../InventoryGroupDetail';
import { Provider } from 'react-redux';

jest.mock('../../../Utilities/useFeatureFlag');

describe('group detail page component', () => {
    let getByRole;
    let container;

    beforeEach(() => {
        const rendered = render(
            <MemoryRouter>
                <Provider store={getStore()}>
                    <InventoryGroupDetail groupId="group-id-2" />
                </Provider>
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
