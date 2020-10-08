import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import * as redux from 'react-redux';

import { init } from '../store';
import PermissionLoader from './PermissionsLoader';

jest.mock('../hooks/useInventoryWritePermissions', () => ({
    __esModule: true,
    default: () => ({ hasAccess: true, isLoading: false })
}));

describe('PermissionsLoader', () => {
    it('loads permissions on mount', async () => {
        const actionSpy = jest.fn();

        const testMiddleware = () => (next) => (action) => {
            actionSpy(action);
            next(action);
        };

        const store = init(testMiddleware).getStore();

        await act(async () => {
            mount(<redux.Provider store={store}>
                <PermissionLoader />
            </redux.Provider>);
        });

        expect(actionSpy.mock.calls[0][0]).toEqual({
            type: 'LOAD_WRITE_PERMISSIONS_PENDING'
        });
        expect(actionSpy.mock.calls[1][0]).toEqual({
            type: 'LOAD_WRITE_PERMISSIONS_FULFILLED',
            payload: { writePermissions: true }
        });
    });
});
