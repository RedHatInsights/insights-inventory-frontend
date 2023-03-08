import { waitFor } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import { mockSystemProfile } from '../../__mocks__/hostApi';
import useGroupFilter from './useGroupFilter';

describe('useGroupFilter', () => {
    const mockStore = configureStore([promiseMiddleware()]);
    beforeEach(() => {
        mockSystemProfile.onGet().replyOnce(200);
    });

    describe('with groups yet not loaded', () => {
        const wrapper = ({ children }) => (
            <Provider store={mockStore({})}>
                {children}
            </Provider>
        );

        it('should initiate an API request', async () => {
            renderHook(useGroupFilter, { wrapper });
            await waitFor(() => {
                expect(mockSystemProfile.history.get.length).toBe(1);
            });
            mockSystemProfile.resetHistory();
        });

        it('should return empty state value', () => {
            const { result } = renderHook(useGroupFilter, { wrapper });
            expect(result.current).toMatchSnapshot();
        });
    });

    describe('with groups loaded', () => {
        const wrapper = ({ children }) => (
            <Provider
                store={mockStore({
                    entities: {
                        groups: [
                            {
                                label: 'sre-group0',
                                value: 'sre-group0'
                            },
                            {
                                label: 'sre-group1',
                                value: 'sre-group1'
                            },
                            {
                                label: 'sre-group2',
                                value: 'sre-group2'
                            },
                            {
                                label: 'sre-group3',
                                value: 'sre-group3'
                            }
                        ]
                    }
                })}
            >
                {children}
            </Provider>
        );

        it('should match snapshot', () => {
            const { result } = renderHook(useGroupFilter, { wrapper });
            expect(result.current).toMatchSnapshot();
        });

        /*
        This test should be rewritten when I connect group filters to the redux store
        it('should return correct filter config', () => {
            const { result } = renderHook(useGroupFilter, { wrapper });
            const [config] = result.current;
            expect(config.filterValues.items).toBe([
                {
                    label: 'sre-group0',
                    value: 'sre-group0'
                },
                {
                    label: 'sre-group1',
                    value: 'sre-group1'
                },
                {
                    label: 'sre-group2',
                    value: 'sre-group2'
                },
                {
                    label: 'sre-group3',
                    value: 'sre-group3'
                }
            ]);
            expect(config.label).toBe('Groups');
        }); */

        it('should return correct chips array, current value and value setter', () => {
            const { result } = renderHook(useGroupFilter, { wrapper });
            const [, chips, value, setValue] = result.current;
            expect(chips.length).toBe(0);
            expect(value.length).toBe(0);
            act(() => {
                setValue(['Group1']);
            });
            const [, chipsUpdated, valueUpdated] = result.current;
            expect(chipsUpdated.length).toBe(1);
            expect(valueUpdated).toEqual(['Group1']);
            expect(chipsUpdated).toMatchSnapshot();
        });
    });
});
