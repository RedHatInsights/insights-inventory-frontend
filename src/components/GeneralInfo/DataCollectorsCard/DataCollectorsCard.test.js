/* eslint-disable camelcase */
import React from 'react';
import { render } from 'enzyme';
import toJson from 'enzyme-to-json';
import DataCollectorsCard from './DataCollectorsCard';
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

describe('DataCollectorsCard', () => {
    let initialState;
    let mockStore;

    beforeEach(() => {
        mockStore = configureStore();
        initialState = {
            entityDetails: {
                entity: {
                    per_reporter_staleness: {
                        puptoo: {
                            check_in_succeeded: true,
                            last_check_in: '2022-05-13T07:42:21.663665+00:00',
                            stale_timestamp: '2260-01-01T00:00:00+00:00'
                        }
                    },
                    insights_id: '1234'
                }
            },
            systemProfileStore: {
                systemProfile: {
                    loaded: true
                }
            }
        };
    });

    it('should render correctly - no data', () => {
        const store = mockStore({ systemProfileStore: {}, entityDetails: {} });
        const wrapper = render(<DataCollectorsCard store={ store } />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render correctly with data', () => {
        const store = mockStore(initialState);
        const wrapper = render(<DataCollectorsCard store={ store } />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render custom collectors', () => {
        const store = mockStore(initialState);
        const wrapper = render(<DataCollectorsCard store={ store } {...{ collectors: [
            {
                name: 'collector name',
                status: true,
                updated: '2260-01-01T00:00:00+00:00',
                details: {
                    name: 'reporter id',
                    id: '1234567'
                }
            }
        ] }} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
