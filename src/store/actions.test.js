/* eslint-disable camelcase */
import { editAnsibleHost, editDisplayName, fetchGroups, systemProfile } from './actions';
import { hosts } from '../api';
import mockedData from '../__mocks__/mockedData.json';
import mockedGroups from '../__mocks__/mockedGroups.json';
import MockAdapter from 'axios-mock-adapter';

const mocked = new MockAdapter(hosts.axios);

describe('systemProfile', () => {
    it('should return correct redux action', async () => {
        mocked.onGet('/api/inventory/v1/hosts/4/system_profile').reply(200, mockedData);
        const { type, payload } = systemProfile('4');
        expect(type).toBe('LOAD_SYSTEM_PROFILE');
        expect(await payload).toEqual(mockedData);
    });
});

describe('editDisplayName', () => {
    it('should call correct endpoint', async () => {
        mocked.onPatch('/api/inventory/v1/hosts/4').reply(({ data }) => {
            expect(data).toEqual(JSON.stringify({ display_name: 'test-value' })); // eslint-disable-line camelcase
            return [200, mockedData];
        });
        const { type, meta } = await editDisplayName('4', 'test-value');
        expect(type).toBe('UPDATE_DISPLAY_NAME');
        expect(meta).toEqual({
            id: '4',
            value: 'test-value',
            origValue: undefined,
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
        mocked.onPatch('/api/inventory/v1/hosts/4').reply(({ data }) => {
            expect(data).toEqual(JSON.stringify({ ansible_host: 'test-value' })); // eslint-disable-line camelcase
            return [200, mockedData];
        });
        const { type, meta } = await editAnsibleHost('4', 'test-value');
        expect(type).toBe('SET_ANSIBLE_HOST');
        expect(meta).toEqual({
            id: '4',
            value: 'test-value',
            origValue: undefined,
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

describe('fetchGroups', () => {
    it('should call correct endpoint', async () => {
        mocked.onGet(new RegExp('/api/inventory/v1/groups*')).reply(() => {
            return [200, mockedGroups];
        });
        const { type, payload } = await fetchGroups();
        expect(type).toBe('GROUPS');
        expect(await payload).toEqual(mockedGroups);
    });
});
