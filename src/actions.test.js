import { ACTION_TYPES } from './constants';

import { loadEntity } from './actions';
import fetchMock from 'fetch-mock';

describe('Async', () => {
    const mockedData = {
        // eslint-disable-next-line camelcase
        hybrid_cloud: { is_entitled: true },
        // eslint-disable-next-line camelcase
        insights: { is_entitled: true },
        // eslint-disable-next-line camelcase
        openshift: { is_entitled: true },
        // eslint-disable-next-line camelcase
        smart_management: { is_entitled: false }
    };

    test('load entity detail', async () => {
        fetchMock.getOnce('/api/entitlements/v1/services', {
            entitlements: mockedData
        });
        const entities = loadEntity();
        expect(entities).toMatchObject({ type: ACTION_TYPES.GET_ENTITY });
        const { entitlements } = await entities.payload;
        expect(entitlements).toMatchObject(mockedData);
    });

    afterEach(() => {
        fetchMock.reset();
    });
});
