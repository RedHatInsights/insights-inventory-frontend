/* eslint-disable camelcase */
import React from 'react';
import { act } from 'react-dom/test-utils';
import InventoryTable from './InventoryTable';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import * as loadSystems from '../../Utilities/sharedFunctions';
import SkeletonTable from '@redhat-cloud-services/frontend-components/SkeletonTable';
import { Pagination } from '@patternfly/react-core';

import ReducerRegistry, { applyReducerHash } from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import promise from 'redux-promise-middleware';
import entitiesReducer from '../../store/entities';
import debounce from 'lodash/debounce';
import { mockSystemProfile } from '../../__mocks__/hostApi';

jest.mock('lodash/debounce');
jest.mock('../../Utilities/useFeatureFlag');

describe('InventoryTable - initial loading', () => {
    let initialState;
    let spy;

    beforeEach(() => {
        debounce.mockImplementation(fn => fn);
        initialState = {
            entities: {
                activeFilters: [{}],
                loaded: true,
                rows: [{ name: 'abc', display_name: 'result_origina', id: '1', system_profile: {} }],
                columns: [{ key: 'one', title: 'One' }],
                page: 1,
                perPage: 50,
                total: 500,
                sortBy: {
                    index: 1,
                    key: 'one',
                    direction: 'asc'
                }
            }
        };
        spy = jest.spyOn(loadSystems, 'loadSystems').mockImplementation(() => ({ type: 'reload' }));
        mockSystemProfile.onGet().reply(200, { results: [] });
    });

    afterEach(() => {
        spy.mockRestore();
    });

    it.only('should render loading state when initialLoading set', async () => {
        spy.mockRestore();
        jest.useFakeTimers();

        const registry = new ReducerRegistry({}, [promise]);
        registry.register({
            entities: applyReducerHash(entitiesReducer, initialState.entities)
        });
        const store = registry.getStore();

        // eslint-disable-next-line no-import-assign
        const getEntities = jest.fn().mockImplementation(() =>  Promise.resolve({
            results: [{ name: '123', display_name: 'result_1', id: '123', system_profile: {} }],
            total: 12
        }));

        let wrapper;

        await act(async () => {
            wrapper = mount(<Provider store={ store }>
                <Router>
                    <InventoryTable initialLoading getEntities={getEntities}/>
                </Router>
            </Provider>);
        });

        expect(wrapper.find(SkeletonTable)).toHaveLength(1);
        expect(wrapper.find(Pagination)).toHaveLength(0);

        await act(async () => {
            jest.runAllTimers();
        });
        wrapper.update();

        expect(wrapper.find(SkeletonTable)).toHaveLength(0);
        expect(wrapper.find('Pagination')).toHaveLength(2);
    });
});
