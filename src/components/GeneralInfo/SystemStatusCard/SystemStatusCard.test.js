/* eslint-disable camelcase */
import React from 'react';
import { render } from 'enzyme';
import toJson from 'enzyme-to-json';
import SystemStatusCard from './SystemStatusCard';
import configureStore from 'redux-mock-store';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => ({
        pathname: 'localhost:3000/example/path'
    }),
    useHistory: () => ({
        push: () => undefined
    })
}));

describe('SystemStatusCard', () => {
    let initialState;
    let mockStore;

    beforeEach(() => {
        mockStore = configureStore();
        initialState = {
            entityDetails: {
                entity: {
                    updated: '6/01/2014',
                    created: '04/01/2014'
                }
            },
            systemProfileStore: {
                systemProfile: {
                    loaded: true,
                    rhc_client_id: ['1234']
                }
            }
        };
    });

    it('should render correctly - no data', () => {
        const store = mockStore({ systemProfileStore: {}, entityDetails: {} });
        const wrapper = render(<SystemStatusCard store={ store } />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render correctly with data', () => {
        const store = mockStore(initialState);
        const wrapper = render(<SystemStatusCard store={ store } />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    [
        'hasState',
        'hasLastCheckIn',
        'hasRegistered',
        'hasRHC'
    ].map((item) => it(`should not render ${item}`, () => {
        const store = mockStore(initialState);
        const wrapper = render(<SystemStatusCard store={ store } {...{ [item]: false }} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    }));
});
