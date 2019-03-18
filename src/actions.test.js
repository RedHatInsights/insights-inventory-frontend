import { ACTION_TYPES } from './constants';

import { loadEntities, loadEntity, addAlert, dismissAlert } from './actions';
import fetchMock from 'fetch-mock';

describe('Alerts', () => {
    test('should be added - default', () => {
        expect(addAlert({ title: 'Some title' })).toMatchObject(
            {
                type: ACTION_TYPES.ALERT_ADD,
                payload: {
                    title: 'Some title',
                    dismissible: false,
                    variant: 'warning'
                }
            }
        );
    });

    test('should add dismissible', () => {
        expect(addAlert({ title: 'Some title', dismissible: true })).toMatchObject(
            {
                type: ACTION_TYPES.ALERT_ADD,
                payload: {
                    title: 'Some title',
                    dismissible: true,
                    variant: 'warning'
                }
            }
        );
    });

    test('should add variant error', () => {
        expect(addAlert({ title: 'Some title', variant: 'error' })).toMatchObject(
            {
                type: ACTION_TYPES.ALERT_ADD,
                payload: {
                    title: 'Some title',
                    dismissible: false,
                    variant: 'error'
                }
            }
        );
    });

    test('should dismiss alert - without timeout', () => {
        expect(dismissAlert('alert')).toMatchObject(
            {
                type: ACTION_TYPES.ALERT_DISMISS,
                alert: 'alert',
                timeout: false
            }
        );
    });

    test('should dismiss alert - with timeout', () => {
        expect(dismissAlert('alert', true)).toMatchObject(
            {
                type: ACTION_TYPES.ALERT_DISMISS,
                alert: 'alert',
                timeout: true
            }
        );
    });
});

describe('Async', () => {
    const mockedData = {
        count: 50,
        page: 1,
        // eslint-disable-next-line camelcase
        per_page: 50,
        results: [{ id: 1 }],
        total: 100
    };

    test('load entities', async () => {
        fetchMock.getOnce('/r/insights/platform/inventory/api/v1/hosts', mockedData);
        const entities = loadEntities({});
        expect(entities).toMatchObject({ type: ACTION_TYPES.GET_ENTITIES });
        const { results } = await entities.payload;
        expect(results).toHaveLength(1);
        expect(results[0]).toMatchObject({ id: 1 });
    });

    test('load entities', async () => {
        fetchMock.getOnce('/r/insights/platform/inventory/api/v1/hosts/1', mockedData);
        const entities = loadEntity(1);
        expect(entities).toMatchObject({ type: ACTION_TYPES.GET_ENTITY });
        const { results } = await entities.payload;
        expect(results).toHaveLength(1);
        expect(results[0]).toMatchObject({ id: 1 });
    });

    afterEach(() => {
        fetchMock.reset();
    });
});
