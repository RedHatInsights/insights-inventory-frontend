import {
  editAnsibleHost,
  editDisplayName,
  fetchGroups,
  systemProfile,
} from './actions';
import mockedData from '../__mocks__/mockedData.json';
import mockedGroups from '../__mocks__/mockedGroups.json';
import MockAdapter from 'axios-mock-adapter';
import { hostInventoryApi } from '../api/hostInventoryApi';

const mocked = new MockAdapter(hostInventoryApi().axios);

describe('systemProfile', () => {
  it('should return correct redux action', async () => {
    mocked
      .onGet('/api/inventory/v1/hosts/4/system_profile')
      .reply(200, mockedData);
    const { type, payload } = systemProfile('4');
    expect(type).toBe('LOAD_SYSTEM_PROFILE');
    expect(await payload).toEqual(mockedData);
  });
});

describe('editDisplayName', () => {
  const addNotification = jest.fn();
  it('should call correct endpoint', () => {
    mocked.onPatch('/api/inventory/v1/hosts/4').reply(({ data }) => {
      expect(data).toEqual(JSON.stringify({ display_name: 'test-value' }));
      return [200, mockedData];
    });
    const { type, meta } = editDisplayName(
      '4',
      'test-value',
      undefined,
      addNotification,
    );
    expect(type).toBe('UPDATE_DISPLAY_NAME');
    expect(meta).toEqual(
      expect.objectContaining({
        id: '4',
        value: 'test-value',
        origValue: undefined,
      }),
    );
  });
});

describe('editAnsibleHost', () => {
  const addNotification = jest.fn();
  it('should call correct endpoint', () => {
    mocked.onPatch('/api/inventory/v1/hosts/4').reply(({ data }) => {
      expect(data).toEqual(JSON.stringify({ ansible_host: 'test-value' }));
      return [200, mockedData];
    });
    const { type, meta } = editAnsibleHost(
      '4',
      'test-value',
      undefined,
      addNotification,
    );
    expect(type).toBe('SET_ANSIBLE_HOST');
    expect(meta).toEqual(
      expect.objectContaining({
        id: '4',
        value: 'test-value',
        origValue: undefined,
        notifications: {
          fulfilled: expect.any(Function),
          rejected: expect.any(Function),
        },
      }),
    );
  });
});

describe('fetchGroups', () => {
  it('should call correct endpoint', async () => {
    mocked.onGet(new RegExp('/api/inventory/v1/groups*')).reply(() => {
      return [200, mockedGroups];
    });
    const { type, payload } = fetchGroups();
    expect(type).toBe('GROUPS');
    expect(await payload).toEqual(mockedGroups);
  });
});
