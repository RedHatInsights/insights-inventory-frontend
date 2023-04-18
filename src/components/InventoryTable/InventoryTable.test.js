/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
import React from 'react';
import { act } from 'react-dom/test-utils';
import InventoryTable from './InventoryTable';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import { BrowserRouter as Router } from 'react-router-dom';
import toJson from 'enzyme-to-json';
import { ConditionalFilter } from '@redhat-cloud-services/frontend-components/ConditionalFilter';
import * as loadSystems from '../../Utilities/sharedFunctions';
import { mockSystemProfile } from '../../__mocks__/hostApi';
import useFeatureFlag from '../../Utilities/useFeatureFlag';

jest.mock('../../Utilities/useFeatureFlag');

describe('InventoryTable', () => {
    let initialState;
    let mockStore;
    let spy;

    beforeEach(() => {
        mockStore = configureStore([promiseMiddleware()]);
        initialState = {
            entities: {
                activeFilters: [{}],
                loaded: false,
                rows: [],
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

    it('should render correctly - no data', () => {
        const store = mockStore({ entities: {} });
        const wrapper = mount(<Provider store={ store }>
            <Router>
                <InventoryTable/>
            </Router>
        </Provider>);
        expect(toJson(wrapper.find('ForwardRef').first(), { mode: 'shallow' })).toMatchSnapshot();
    });

    it('should render correctly', () => {
        const store = mockStore(initialState);
        const wrapper = mount(<Provider store={ store }>
            <Router>
                <InventoryTable/>
            </Router>
        </Provider>);
        expect(toJson(wrapper.find('ForwardRef').first(), { mode: 'shallow' })).toMatchSnapshot();
    });

    it('should render correctly with error', () => {
        const store = mockStore({
            entities: {
                ...initialState.entities,
                error: new Error('Loading error')
            }
        });
        const wrapper = mount(<Provider store={ store }>
            <Router>
                <InventoryTable/>
            </Router>
        </Provider>);
        expect(toJson(wrapper.find('ForwardRef').first(), { mode: 'shallow' })).toMatchSnapshot();
    });

    it('should render correctly with custom error', () => {
        const store = mockStore({
            entities: {
                ...initialState.entities,
                error: new Error('Loading error')
            }
        });
        const wrapper = mount(<Provider store={ store }>
            <Router>
                <InventoryTable errorState={ <div>CUSTOM ERROR STATE</div> } />
            </Router>
        </Provider>);
        expect(toJson(wrapper.find('ForwardRef').first(), { mode: 'shallow' })).toMatchSnapshot();
    });

    it('should render correctly - with no access', () => {
        const store = mockStore(initialState);
        const wrapper = mount(<Provider store={ store }>
            <Router>
                <InventoryTable hasAccess={false}/>
            </Router>
        </Provider>);
        expect(toJson(wrapper.find('ForwardRef').first(), { mode: 'shallow' })).toMatchSnapshot();
    });

    it('should render correctly - with no access and full view', () => {
        const store = mockStore(initialState);
        const wrapper = mount(<Provider store={ store }>
            <Router>
                <InventoryTable hasAccess={false} isFullView/>
            </Router>
        </Provider>);
        expect(toJson(wrapper.find('ForwardRef').first(), { mode: 'shallow' })).toMatchSnapshot();
    });

    it('should render correctly with items', () => {
        const store = mockStore(initialState);
        const wrapper = mount(<Provider store={ store }>
            <Router>
                <InventoryTable
                    items={[{ id: 'someId' }]}
                    page={5}
                    perPage={20}
                    total={200}
                    sortBy={{
                        index: 1,
                        key: 'one',
                        direction: 'asc'
                    }}
                />
            </Router>
        </Provider>);
        expect(toJson(wrapper.find('ForwardRef').first(), { mode: 'shallow' })).toMatchSnapshot();
    });

    it('should render correctly with items no totla', () => {
        const store = mockStore(initialState);
        const wrapper = mount(<Provider store={ store }>
            <Router>
                <InventoryTable
                    items={[{ id: 'someId' }]}
                    page={5}
                    perPage={20}
                    sortBy={{
                        index: 1,
                        key: 'one',
                        direction: 'asc'
                    }}
                />
            </Router>
        </Provider>);
        expect(toJson(wrapper.find('ForwardRef').first(), { mode: 'shallow' })).toMatchSnapshot();
    });

    describe('autoRefresh', () => {
        class Dummy extends React.Component {
            render() {
                const { store, ...props } = this.props;

                return (
                    <Provider store={ store }>
                        <Router>
                            <InventoryTable {...props} />
                        </Router>
                    </Provider>
                );
            }
        }

        it('should not reload on customFilters', async () => {
            const store = mockStore(initialState);
            const wrapper = mount(<Dummy store={ store } />);

            await act(async () => {
                wrapper.setProps({ customFilters: { system_profile: { sap_ids: ['id1'] } } });
            });
            wrapper.update();

            expect(spy).not.toHaveBeenCalled();
        });

        it('should reload on customFilters', async () => {
            const store = mockStore(initialState);
            let wrapper;

            await act(async () => {
                wrapper = mount(<Dummy store={ store } autoRefresh />);
                wrapper.setProps({ customFilters: { system_profile: { sap_ids: ['id1'] } } });
            });
            wrapper.update();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('hideFilters', () => {
        it('should disable all filters', () => {
            const store = mockStore(initialState);
            const wrapper = mount(<Provider store={ store }>
                <Router>
                    <InventoryTable hideFilters={{ all: true }} showTags/>
                </Router>
            </Provider>);

            expect(wrapper.find(ConditionalFilter)).toHaveLength(0);
        });

        it('should disable only one filter', () => {
            useFeatureFlag.mockReturnValue(true);
            const store = mockStore(initialState);
            const wrapper = mount(<Provider store={ store }>
                <Router>
                    <InventoryTable hideFilters={{ name: true }} showTags/>
                </Router>
            </Provider>);

            expect(wrapper.find(ConditionalFilter).props().items.map(({ label }) => label)).toEqual(
                ['Status',
                    'Operating System',
                    'Data Collector',
                    'RHC status',
                    'System Update Method',
                    'Last seen',
                    'Group',
                    'Tags']
            );
        });

        it('should disable all and enable one', () => {
            const store = mockStore(initialState);
            const wrapper = mount(<Provider store={ store }>
                <Router>
                    <InventoryTable hideFilters={{ all: true, name: false }} showTags/>
                </Router>
            </Provider>);

            expect(wrapper.find(ConditionalFilter).props().items.map(({ value }) => value)).toEqual(
                ['name-filter']
            );
        });
    });
});
