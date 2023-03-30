/* eslint-disable camelcase */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchInput from '../SearchInput';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import groups from '../../../../../cypress/fixtures/groups.json';

describe('SearchInput', () => {
    let mockStore;
    const initialStore = {
        groups
    };
    beforeEach(() => {
        mockStore = configureStore();
    });

    test('displays select options when the user clicks on the component', async () => {
        const store = mockStore(initialStore);
        render(<Provider store={store}><SearchInput /></Provider>);
        fireEvent.click(screen.getByRole('textbox', { placeholder: 'Type or click to select a group' }));
        const options = await screen.findAllByRole('option');
        expect(options).toHaveLength(1);
    });
});
