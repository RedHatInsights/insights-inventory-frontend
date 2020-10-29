/* eslint-disable camelcase */
import { ACTION_TYPES } from './constants';

import { loadEntity } from './actions';
import fetchMock from 'fetch-mock';

describe('Async', () => {
    const mockedData = {
        hybrid_cloud: { is_entitled: true },
        insights: { is_entitled: true },
        openshift: { is_entitled: true },
        smart_management: { is_entitled: false }
    };

    test('load entity detail', async () => {
        const entities = loadEntity();
        expect(entities).toMatchObject({ type: ACTION_TYPES.GET_ENTITY });
        const { entitlements } = await entities.payload;
        expect(entitlements).toMatchObject(mockedData);
    });

    afterEach(() => {
        fetchMock.reset();
    });
});
