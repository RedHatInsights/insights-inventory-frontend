/* eslint-disable camelcase */
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

        it('should return empty state value', () => {
            const { result } = renderHook(useGroupFilter, { wrapper });
            expect(result.current).toMatchSnapshot();
        });
    });

    describe('with groups loaded', () => {
        const wrapper = ({ children }) => (
            <Provider
                store={mockStore({
                    groups: {
                        data: {
                            page: 1,
                            count: 50,
                            results: [{
                                created_at: '2019-02-18T23:00:00.0Z',
                                id: '4f5B88dBe1D4eB732B388abc1Baa4BAc',
                                updated_at: '1960-11-06T23:00:00.0Z',
                                org_id: 'nostrud in deserunt',
                                account: 'ullamco dolore pariatur sint',
                                host_ids: [
                                    '5f20569C-9E96-C794-887c-1Cb5D6e220b2',
                                    'D34e68beFc2d4fF1C19CF4CaF913d1b6',
                                    '76D3AcBB-5B4C-8BB8-f3BB-69808CcFa84A',
                                    '185dC76d-D6B8-059b-1bCb-685D2edd0CEa',
                                    '50E0cAaDCace55e07AebC7Bcc40cfdAD',
                                    'be8e0A09AdEE9a23fe65972F43D31bDA',
                                    '8B6764001Bf6d0bA4E6aEdCAf207bf71',
                                    '80CffFbd-04C9-cBB6-5Bf5-Dc0eBbDBba70',
                                    '55d8323C-dEbC-B10e-f88e-23ba37068C9f',
                                    'C5A8Fd55a0B6fa3A3a748cb0a4cc20BB',
                                    '1dF767C34BF222E65BD46BcC3A62de4b',
                                    '4d44747b1D8D1648EC5713e983984a6C',
                                    'b89A20e9da89Eb9862502748ca9aa0bf',
                                    'F24dc6A1548B40dF453FdBEa4DD5CbEB',
                                    '2Ba0BCE6-F8cC-FAFE-Ed72-f7BF01dC60A4',
                                    '1f255AB7-d49f-f8Ff-48eD-B9c6E4674Fe2',
                                    '8277DD2f3Fc0aaE89D601400E86E4E86',
                                    '3Be6b8FE-8B32-240d-9C0f-0c074baC5EBb',
                                    '94c4bBCB31D0dfa37e955Dc94eAd3Dc0',
                                    '2B0725BE87671E4DffE19F0f7fc8aFe7'
                                ],
                                name: 'nisi ut consequat ad'
                            },
                            {
                                created_at: '2019-02-18T23:00:00.0Z',
                                id: '4f5B88dBe1D4eB732B388abc1Baa4BAc',
                                updated_at: '1960-11-06T23:00:00.0Z',
                                org_id: 'nostrud in deserunt',
                                account: 'ullamco dolore pariatur sint',
                                host_ids: [
                                    '5f20569C-9E96-C794-887c-1Cb5D6e220b2',
                                    'D34e68beFc2d4fF1C19CF4CaF913d1b6',
                                    '76D3AcBB-5B4C-8BB8-f3BB-69808CcFa84A',
                                    '185dC76d-D6B8-059b-1bCb-685D2edd0CEa',
                                    '50E0cAaDCace55e07AebC7Bcc40cfdAD',
                                    'be8e0A09AdEE9a23fe65972F43D31bDA',
                                    '8B6764001Bf6d0bA4E6aEdCAf207bf71',
                                    '80CffFbd-04C9-cBB6-5Bf5-Dc0eBbDBba70',
                                    '55d8323C-dEbC-B10e-f88e-23ba37068C9f',
                                    'C5A8Fd55a0B6fa3A3a748cb0a4cc20BB',
                                    '1dF767C34BF222E65BD46BcC3A62de4b',
                                    '4d44747b1D8D1648EC5713e983984a6C',
                                    'b89A20e9da89Eb9862502748ca9aa0bf',
                                    'F24dc6A1548B40dF453FdBEa4DD5CbEB',
                                    '2Ba0BCE6-F8cC-FAFE-Ed72-f7BF01dC60A4',
                                    '1f255AB7-d49f-f8Ff-48eD-B9c6E4674Fe2',
                                    '8277DD2f3Fc0aaE89D601400E86E4E86',
                                    '3Be6b8FE-8B32-240d-9C0f-0c074baC5EBb',
                                    '94c4bBCB31D0dfa37e955Dc94eAd3Dc0',
                                    '2B0725BE87671E4DffE19F0f7fc8aFe7'
                                ],
                                name: 'nisi ut consequat ad1'
                            },
                            {
                                created_at: '2019-02-18T23:00:00.0Z',
                                id: '4f5B88dBe1D4eB732B388abc1Baa4BAc',
                                updated_at: '1960-11-06T23:00:00.0Z',
                                org_id: 'nostrud in deserunt',
                                account: 'ullamco dolore pariatur sint',
                                host_ids: [
                                    '5f20569C-9E96-C794-887c-1Cb5D6e220b2',
                                    'D34e68beFc2d4fF1C19CF4CaF913d1b6',
                                    '76D3AcBB-5B4C-8BB8-f3BB-69808CcFa84A',
                                    '185dC76d-D6B8-059b-1bCb-685D2edd0CEa',
                                    '50E0cAaDCace55e07AebC7Bcc40cfdAD',
                                    'be8e0A09AdEE9a23fe65972F43D31bDA',
                                    '8B6764001Bf6d0bA4E6aEdCAf207bf71',
                                    '80CffFbd-04C9-cBB6-5Bf5-Dc0eBbDBba70',
                                    '55d8323C-dEbC-B10e-f88e-23ba37068C9f',
                                    'C5A8Fd55a0B6fa3A3a748cb0a4cc20BB',
                                    '1dF767C34BF222E65BD46BcC3A62de4b',
                                    '4d44747b1D8D1648EC5713e983984a6C',
                                    'b89A20e9da89Eb9862502748ca9aa0bf',
                                    'F24dc6A1548B40dF453FdBEa4DD5CbEB',
                                    '2Ba0BCE6-F8cC-FAFE-Ed72-f7BF01dC60A4',
                                    '1f255AB7-d49f-f8Ff-48eD-B9c6E4674Fe2',
                                    '8277DD2f3Fc0aaE89D601400E86E4E86',
                                    '3Be6b8FE-8B32-240d-9C0f-0c074baC5EBb',
                                    '94c4bBCB31D0dfa37e955Dc94eAd3Dc0',
                                    '2B0725BE87671E4DffE19F0f7fc8aFe7'
                                ],
                                name: 'nisi ut consequat ad2'
                            }
                            ],
                            total: 100
                        }
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

        it('should return correct chips array, current value and value setter', () => {
            const { result } = renderHook(useGroupFilter, { wrapper });
            const [, chips, value, setValue] = result.current;
            expect(chips.length).toBe(0);
            expect(value.length).toBe(0);
            act(() => {
                setValue(['nisi ut consequat ad1']);
            });
            const [, chipsUpdated, valueUpdated] = result.current;
            expect(chipsUpdated.length).toBe(1);
            expect(valueUpdated).toEqual(['nisi ut consequat ad1']);
            expect(chipsUpdated).toMatchSnapshot();
        });

        it('should return empty state value if no groups obtained', () => {
            const wrapper = ({ children }) => (
                <Provider
                    store={mockStore({
                        groups: {
                            data: {
                                page: 1,
                                count: 50,
                                results: [],
                                total: 100
                            }
                        }
                    })}
                >
                    {children}
                </Provider>
            );
            const { result } = renderHook(useGroupFilter, { wrapper });
            expect(result.current).toMatchSnapshot();
        });
    });
});
