/* eslint-disable camelcase */
import { ACTION_TYPES } from './constants';

import { editAnsibleHost, editDisplayName, loadEntity, systemProfile } from './actions';
import fetchMock from 'fetch-mock';
import { mock } from './__mocks__/hostApi';
import mockedData from './__mocks__/mockedData.json';

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

describe('systemProfile', () => {
    it('should return correct redux action', async () => {
        mock.onGet('/api/inventory/v1/hosts/4/system_profile').reply(200, mockedData);
        const { type, payload } = systemProfile('4');
        expect(type).toBe('LOAD_SYSTEM_PROFILE');
        expect(await payload).toEqual(mockedData);
    });
});

describe('editDisplayName', () => {
    it('should call correct endpoint', async () => {
        mock.onPatch('/api/inventory/v1/hosts/4').reply(({ data }) => {
            expect(data).toEqual(JSON.stringify({ display_name: 'test-value' })); // eslint-disable-line camelcase
            return [200, mockedData];
        });
        const { type, meta } = await editDisplayName('4', 'test-value');
        expect(type).toBe('UPDATE_DISPLAY_NAME');
        expect(meta).toEqual({
            notifications: {
                fulfilled: {
                    variant: 'success',
                    title: 'Display name for entity with ID 4 has been changed to test-value',
                    dismissable: true
                }
            }
        });
    });
});

describe('editAnsibleHost', () => {
    it('should call correct endpoint', async () => {
        mock.onPatch('/api/inventory/v1/hosts/4').reply(({ data }) => {
            expect(data).toEqual(JSON.stringify({ ansible_host: 'test-value' })); // eslint-disable-line camelcase
            return [200, mockedData];
        });
        const { type, meta } = await editAnsibleHost('4', 'test-value');
        expect(type).toBe('SET_ANSIBLE_HOST');
        expect(meta).toEqual({
            notifications: {
                fulfilled: {
                    variant: 'success',
                    title: 'Ansible hostname has been updated',
                    dismissable: true
                }
            }
        });
    });
});
