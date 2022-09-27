import { waitFor } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import { mockSystemProfile } from '../../__mocks__/hostApi';
import useOperatingSystemFilter from './useOperatingSystemFilter';

describe('useOperatingSystemFilter', () => {
    const mockStore = configureStore([promiseMiddleware()]);

    beforeEach(() => {
        mockSystemProfile.onGet().replyOnce(200);
    });

    describe('with operating systems yet not loaded', () => {
        const wrapper = ({ children }) => (
            <Provider store={mockStore({})}>
                {children}
            </Provider>
        );

        it('should initiate an API request', async () => {
            renderHook(useOperatingSystemFilter, { wrapper });
            await waitFor(() => {
                expect(mockSystemProfile.history.get.length).toBe(1);
            });
            mockSystemProfile.resetHistory();
        });

        it('should return empty state value', () => {
            const { result } = renderHook(useOperatingSystemFilter, { wrapper });
            expect(result.current).toMatchSnapshot();
        });
    });

    describe('with operating systems loaded', () => {
        const wrapper = ({ children }) => (
            <Provider
                store={mockStore({
                    entities: {
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
                })}
            >
                {children}
            </Provider>
        );

        it('should match snapshot', () => {
            const { result } = renderHook(useOperatingSystemFilter, { wrapper });
            expect(result.current).toMatchSnapshot();
        });

        it('should return correct filter config', () => {
            const { result } = renderHook(useOperatingSystemFilter, { wrapper });
            const [config] = result.current;
            expect(config.filterValues.groups.length).toBe(2);
            expect(config.label).toBe('Operating System'); // should be all caps
            expect(config.type).toBe('group');
        });

        it('should return correct chips array, current value and value setter', () => {
            const { result } = renderHook(useOperatingSystemFilter, { wrapper });
            const [, chips, value, setValue] = result.current;
            expect(chips.length).toBe(0);
            expect(value.length).toBe(0);
            act(() => {
                setValue(['8.4']);
            });
            const [, chipsUpdated, valueUpdated] = result.current;
            expect(chipsUpdated.length).toBe(1);
            expect(valueUpdated).toEqual(['8.4']);
            expect(chipsUpdated).toMatchSnapshot();
        });

        it('should return empty state value if no versions obtained', () => {
            const wrapper = ({ children }) => (
                <Provider
                    store={mockStore({
                        entities: {
                            operatingSystems: [],
                            operatingSystemsLoaded: true
                        }
                    })}
                >
                    {children}
                </Provider>
            );
            const { result } = renderHook(useOperatingSystemFilter, { wrapper });
            expect(result.current).toMatchSnapshot();
        });
    });
});
