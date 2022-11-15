/* eslint-disable camelcase */
import React from 'react';
import AppInfo from './AppInfo';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import { NotConnected } from '@redhat-cloud-services/frontend-components/NotConnected';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => ({
        pathname: '/some/path'
    })
}));

let initialState = {};
let mockStore;
let wrapper;
beforeEach(() => {
    mockStore = configureStore([promiseMiddleware()]);
    initialState = {
        entityDetails: {
            loaded: true,
            entity: {
                insights_id: '0253a9b9-f9fb-4ba5-a62e-28cbb3cb16db',
                stale_timestamp: '2260-01-01T00:00:00+00:00',
                stale_warning_timestamp: '2260-01-08T00:00:00+00:00',
                culled_timestamp: '2260-01-15T00:00:00+00:00',
                created: '2022-09-29T10:17:38.158029+00:00',
                updated: '2022-11-14T21:40:08.619998+00:00',
                system_profile: {
                    operating_system: {
                        major: 9,
                        minor: 0,
                        name: 'RHEL'
                    }
                },
                tags: [],
                per_reporter_staleness: {
                    puptoo: {
                        check_in_succeeded: true,
                        stale_timestamp: '2260-01-01T00:00:00+00:00',
                        last_check_in: '2022-11-11T11:29:50.154804+00:00'
                    }
                }
            },
            isToggleOpened: true
        }
    };

    const store = mockStore(initialState);
    wrapper = mount(<Provider store={store}>
        <AppInfo />
    </Provider>);
});

describe('AppInfo', () => {
    it('should render correctly', () => {
        expect(wrapper.find(NotConnected)).toMatchSnapshot();
    });
    it('should render NotConnected component', () => {
        const store = mockStore(initialState);
        const tempWrapper = mount(<Provider store={store}>
            <AppInfo notConnected={true}/>
        </Provider>);

        expect(tempWrapper.find(NotConnected)).toHaveLength(1);
    });

});
