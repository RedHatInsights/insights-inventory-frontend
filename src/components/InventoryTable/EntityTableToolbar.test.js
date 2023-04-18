/* eslint-disable camelcase */
import React from 'react';
import { act } from 'react-dom/test-utils';
import EntityTableToolbar from './EntityTableToolbar';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import toJson from 'enzyme-to-json';
import { mockTags, mockSystemProfile } from '../../__mocks__/hostApi';
import TitleColumn from './TitleColumn';
import debounce from 'lodash/debounce';

jest.mock('lodash/debounce');
jest.mock('../../Utilities/useFeatureFlag');

jest.mock('../../Utilities/constants', () => ({
    ...jest.requireActual('../../Utilities/constants'),
    lastSeenItems: jest.fn().mockReturnValue([])

}));

describe('EntityTableToolbar', () => {
    let initialState;
    let stateWithActiveFilter;
    let mockStore;
    let onRefreshData;

    beforeEach(() => {
        mockTags.onGet().reply(200, { results: [] });
        mockSystemProfile.onGet().reply(200, { results: [] });
        onRefreshData = jest.fn();
        debounce.mockImplementation(jest.requireActual('lodash/debounce'));
        mockStore = configureStore([promiseMiddleware()]);
        initialState = {
            entities: {
                activeFilters: [{}],
                loaded: true,
                rows: [{
                    id: 'testing-id',
                    one: 'data'
                }],
                columns: [{ key: 'one', title: 'One', renderFunc: TitleColumn }],
                page: 1,
                perPage: 50,
                total: 500,
                allTags: [
                    { name: 'something', tags: [
                        { count: 5, tag: {
                            namespace: 'something',
                            key: 'some key',
                            value: 'some value'
                        } },
                        { count: 2, tag: {
                            namespace: 'something',
                            key: 'some key',
                            value: null
                        } }
                    ] },
                    {
                        name: 'null',
                        tags: [
                            { count: 2, tag: {
                                namespace: null,
                                key: 'some key',
                                value: null
                            } }
                        ]
                    }
                ],
                operatingSystems: [
                    {
                        label: 'RHEL 8.0',
                        value: '8.0'
                    },
                    {
                        label: 'RHEL 8.4',
                        value: '8.4'
                    },
                    {
                        label: 'RHEL 8.3',
                        value: '8.3'
                    },
                    {
                        label: 'RHEL 9.0',
                        value: '9.0'
                    }
                ],
                operatingSystemsLoaded: true
            }
        };
        stateWithActiveFilter = {
            entities: {
                ...initialState.entities,
                loaded: true,
                activeFilters: [{ value: 'hostname_or_id', filter: 'test' }]
            }
        };
    });

    describe('DOM', () => {

        it('should render correctly - no data', () => {
            const store = mockStore({
                entities: {
                    loaded: false
                }
            });
            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar onRefreshData={onRefreshData} loaded={false}/>
            </Provider>);
            expect(toJson(wrapper.find('PrimaryToolbar'), { mode: 'shallow' })).toMatchSnapshot();
        });

        it('should render correctly - with tags', () => {
            const store = mockStore(initialState);
            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar showTags onRefreshData={onRefreshData} loaded/>
            </Provider>);
            expect(toJson(wrapper.find('PrimaryToolbar'), { mode: 'shallow' })).toMatchSnapshot();
            expect(toJson(wrapper.find('TagsModal'), { mode: 'shallow' })).toMatchSnapshot();
        });

        it('should render correctly - with no access', () => {
            const store = mockStore(initialState);
            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar hasAccess={false} onRefreshData={onRefreshData} loaded/>
            </Provider>);
            expect(toJson(wrapper.find('PrimaryToolbar'), { mode: 'shallow' })).toMatchSnapshot();
            expect(toJson(wrapper.find('TagsModal'), { mode: 'shallow' })).toMatchSnapshot();
        });

        it('should render correctly - with items', () => {
            const store = mockStore(initialState);
            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar hasItems onRefreshData={onRefreshData} loaded/>
            </Provider>);
            expect(toJson(wrapper.find('PrimaryToolbar'), { mode: 'shallow' })).toMatchSnapshot();
        });

        it('should render correctly - with custom filters', () => {
            const store = mockStore(initialState);
            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar onRefreshData={onRefreshData} loaded filterConfig={{
                    items: [{ label: 'Filter by text' }]
                }} />
            </Provider>);
            expect(toJson(wrapper.find('PrimaryToolbar'), { mode: 'shallow' })).toMatchSnapshot();
        });

        it('should render correctly - with custom activeFilters', () => {
            const store = mockStore(initialState);
            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar onRefreshData={onRefreshData} loaded activeFiltersConfig={{
                    filters: [{
                        category: 'Some',
                        chips: [{
                            name: 'something'
                        }, {
                            name: 'something 2'
                        }]
                    }]
                }} showTags />
            </Provider>);
            expect(toJson(wrapper.find('PrimaryToolbar'), { mode: 'shallow' })).toMatchSnapshot();
        });

        it('should render correctly - with default filters', () => {
            const store = mockStore({
                entities: {
                    ...initialState.entities,
                    activeFilters: [{ staleFilter: ['fresh'] }]
                }
            });
            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar onRefreshData={onRefreshData} loaded />
            </Provider>);
            expect(toJson(wrapper.find('PrimaryToolbar'), { mode: 'shallow' })).toMatchSnapshot();
        });

        it('should render correctly - with default tag filter', () => {
            const store = mockStore({
                entities: {
                    ...initialState.entities,
                    activeFilters: [{ tagFilters: [{
                        type: 'tags', key: 'something', category: 'something', values: [{
                            key: 'some key',
                            group: {
                                label: 'Some tag'
                            },
                            value: 'some value'
                        }]
                    }] }]
                }
            });
            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar onRefreshData={onRefreshData} loaded />
            </Provider>);
            expect(toJson(wrapper.find('PrimaryToolbar'), { mode: 'shallow' })).toMatchSnapshot();
        });

        it('should render correctly - with children', () => {
            const store = mockStore(initialState);
            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar onRefreshData={onRefreshData} loaded><div>something</div></EntityTableToolbar>
            </Provider>);
            expect(toJson(wrapper.find('PrimaryToolbar'), { mode: 'shallow' })).toMatchSnapshot();
        });

        it('should render correctly', () => {
            const store = mockStore(initialState);
            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar page={1} total={500} perPage={50} onRefreshData={onRefreshData} loaded />
            </Provider>);
            expect(toJson(wrapper.find('PrimaryToolbar'), { mode: 'shallow' })).toMatchSnapshot();
        });

        it('should render correctly - with customFilters', () => {
            const store = mockStore(initialState);
            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar onRefreshData={onRefreshData} loaded customFilters={{
                    filters: [{
                        rhcdFilter: ['not_nil']
                    }]
                }} showTags />
            </Provider>);
            expect(toJson(wrapper.find('PrimaryToolbar'), { mode: 'shallow' })).toMatchSnapshot();
        });

    });

    describe('API', () => {
        describe('pagination', () => {
            it('should set page ', () => {
                const store = mockStore(initialState);
                const wrapper = mount(<Provider store={store}>
                    <EntityTableToolbar page={1} total={500} perPage={50} onRefreshData={onRefreshData} loaded />
                </Provider>);
                wrapper.find('button[data-action="next"]').first().simulate('click');

                expect(onRefreshData).toHaveBeenCalledWith({ page: 2 });
            });

            it('should set per page ', () => {
                const store = mockStore(initialState);
                const wrapper = mount(<Provider store={store}>
                    <EntityTableToolbar page={1} total={500} perPage={50} onRefreshData={onRefreshData} loaded />
                </Provider>);
                wrapper.find('.pf-c-options-menu__toggle button.pf-c-options-menu__toggle-button').first().simulate('click');
                wrapper.update();
                wrapper.find('ul.pf-c-options-menu__menu button[data-action="per-page-10"]').simulate('click');
                expect(onRefreshData).toHaveBeenCalledWith({ page: 1, per_page: 10 });
            });
        });

        describe('delete filter', () => {
            it('should dispatch action on delete filter', async () => {
                debounce.mockImplementation(fn => fn);

                const store = mockStore(stateWithActiveFilter);
                const wrapper = mount(<Provider store={store}>
                    <EntityTableToolbar page={1} total={500} perPage={50} onRefreshData={onRefreshData} loaded />
                </Provider>);
                onRefreshData.mockClear();

                await act(async () => {
                    wrapper.find('.pf-c-chip-group__list li div button').first().simulate('click');
                });
                wrapper.update();
                expect(onRefreshData).toHaveBeenCalledWith(
                    { filters: [{ filter: '', value: 'hostname_or_id' }], page: 1, perPage: 50 }
                );
            });

            it('should remove textual filter', async () => {
                debounce.mockImplementation(fn => fn);
                const store = mockStore({
                    entities: {
                        ...initialState.entities,
                        loaded: true,
                        activeFilters: [{ value: 'hostname_or_id', filter: 'test' }]
                    }
                });
                const wrapper = mount(<Provider store={store}>
                    <EntityTableToolbar page={1} total={500} perPage={50} onRefreshData={onRefreshData} loaded />
                </Provider>);
                onRefreshData.mockClear();
                await act(async () => {
                    wrapper.find('.pf-c-chip-group__list li div button').first().simulate('click');
                });
                wrapper.update();
                expect(onRefreshData).toHaveBeenCalledWith(
                    { filters: [{ filter: '', value: 'hostname_or_id' }], page: 1, perPage: 50 }
                );
            });

            it('should remove tag filter', async () => {
                debounce.mockImplementation(fn => fn);
                const store = mockStore({
                    entities: {
                        ...initialState.entities,
                        activeFilters: [{ tagFilters: [{
                            type: 'tags', key: 'something', category: 'something', values: [{
                                key: 'some key',
                                group: {
                                    label: 'Some tag'
                                },
                                value: 'some value'
                            }]
                        }] }]
                    }
                });
                const wrapper = mount(<Provider store={store}>
                    <EntityTableToolbar page={1} total={500} perPage={50} showTags onRefreshData={onRefreshData} loaded />
                </Provider>);
                onRefreshData.mockClear();
                await act(async () => {
                    wrapper.find('.pf-c-chip-group__list li div button').first().simulate('click');
                });
                wrapper.update();
                expect(onRefreshData).toHaveBeenCalledWith(
                    { filters: [{ filter: '', value: 'hostname_or_id' }, { tagFilters: [] }], page: 1, perPage: 50 }
                );
            });

            it('should dispatch action on delete all filters', () => {
                const store = mockStore(stateWithActiveFilter);
                const wrapper = mount(<Provider store={store}>
                    <EntityTableToolbar page={1} total={500} perPage={50} onRefreshData={onRefreshData} loaded />
                </Provider>);
                wrapper.find('.ins-c-chip-filters button.pf-m-link').last().simulate('click');
                const actions = store.getActions();
                expect(actions.length).toBe(4);
                expect(actions[actions.length - 2]).toMatchObject({ type: 'CLEAR_FILTERS' });
                expect(onRefreshData).toHaveBeenCalledWith({ filters: [], page: 1 });
            });

            it('should call function on delete filter', () => {
                const onDelete = jest.fn();
                const store = mockStore(stateWithActiveFilter);
                const wrapper = mount(<Provider store={store}>
                    <EntityTableToolbar page={1} total={500} perPage={50} activeFiltersConfig={{
                        onDelete
                    }} onRefreshData={onRefreshData} loaded />
                </Provider>);
                wrapper.find('.pf-c-chip-group__list li div button').first().simulate('click');
                expect(onDelete).toHaveBeenCalled();
            });
        });

        it('trim leading/trailling whitespace ', async () => {
            debounce.mockImplementation(fn => fn);

            const store = mockStore(initialState);

            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar
                    hideFilters={{ all: true, name: false, group: true }}
                    page={1}
                    total={500}
                    perPage={50}
                    onRefreshData={onRefreshData}
                    loaded />
            </Provider>);

            await act(async () => {
                wrapper.find('input[type="text"]').instance().value = '   some-value   ';
                wrapper.find('input[type="text"]').simulate('change');
            });

            const state = store.getState();
            expect(state.entities.activeFilters).toMatchObject(
                [{}, { filter: 'some-value', value: 'hostname_or_id' }]
            );
        });
    });

    describe('Passes activeFilterConfig correctly', () => {
        it('Uses the activeFilterConfig  when passed it, uses the text passed in instead of the default', () => {
            const store = mockStore(initialState);
            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar hasItems onRefreshData={onRefreshData} loaded
                    activeFiltersConfig={{ deleteTitle: 'Test Reset Filters' }}/>
            </Provider>);
            expect(toJson(wrapper.find('Test Reset Filter')));
            expect(toJson(wrapper.find('Reset Filter'))).toBeFalsy();
        });
        it('Uses the default activeFilterConfig when nothing is passed in, finds default text', () => {
            const store = mockStore(initialState);
            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar hasItems onRefreshData={onRefreshData} loaded/>
            </Provider>);
            expect(toJson(wrapper.find('Reset Filter')));
            expect(toJson(wrapper.find('Test Reset Filter'))).toBeFalsy();
        });
    });

    describe('System update method filter', () => {
        it('Should hide the filter when flag is disabled', () => {
            const store = mockStore(initialState);
            const wrapper = mount(<Provider store={store}>
                <EntityTableToolbar hasItems onRefreshData={onRefreshData} loaded
                    activeFiltersConfig={{ deleteTitle: 'Test Reset Filters' }} />
            </Provider>);
            expect(toJson(wrapper.find('System Update Method'))).toBeFalsy();
        });
    });
});
