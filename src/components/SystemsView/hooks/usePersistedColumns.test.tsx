import '@testing-library/jest-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { expect } from '@jest/globals';
import type { Column } from '../columns/allColumnDefinitions';
import { usePersistedColumns } from './usePersistedColumns';

const TEST_ACCOUNT_NUMBER = '1234567';
const TEST_USERNAME = 'inventory-columns-test-user';
const STORAGE_KEY = `ui.systems-view.columns.${TEST_ACCOUNT_NUMBER}.${TEST_USERNAME}`;

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    auth: {
      getUser: () =>
        Promise.resolve({
          identity: {
            account_number: TEST_ACCOUNT_NUMBER,
            type: 'User',
            user: {
              username: TEST_USERNAME,
              is_org_admin: true,
            },
          },
          entitlements: {
            hybrid_cloud: { is_entitled: true },
            insights: { is_entitled: true },
            openshift: { is_entitled: true },
            smart_management: { is_entitled: false },
          },
        }),
    },
  }),
}));

const createTestColumn = (key: string, isShownByDefault: boolean): Column =>
  ({
    key,
    title: key,
    appName: 'inventory',
    isShownByDefault,
    isShown: isShownByDefault,
    renderCell: () => null,
  }) as Column;

const defaultColumns = [
  createTestColumn('name', true),
  createTestColumn('workspace', true),
  createTestColumn('tags', false),
  createTestColumn('os', true),
] as const;

describe('usePersistedColumns', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads column preferences from localStorage for the signed-in user', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { key: 'os', isShown: true },
        { key: 'name', isShown: false },
        { key: 'workspace', isShown: true },
      ]),
    );

    const { result } = renderHook(() => usePersistedColumns(defaultColumns));

    await waitFor(() => {
      expect(result.current.columns.map((column) => column.key)).toEqual([
        'os',
        'name',
        'workspace',
        'tags',
      ]);
    });

    expect(
      result.current.columns.find((column) => column.key === 'name'),
    ).toMatchObject({
      isShown: false,
    });
    expect(
      result.current.columns.find((column) => column.key === 'os'),
    ).toMatchObject({
      isShown: true,
    });
    expect(
      result.current.columns.find((column) => column.key === 'tags'),
    ).toMatchObject({
      isShown: false,
    });
  });

  it('saves column preferences to localStorage when columns change', async () => {
    const { result } = renderHook(() => usePersistedColumns(defaultColumns));

    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    });

    const updatedColumns = [
      result.current.columns.find((column) => column.key === 'tags')!,
      result.current.columns.find((column) => column.key === 'name')!,
      {
        ...result.current.columns.find((column) => column.key === 'workspace')!,
        isShown: false,
      },
      result.current.columns.find((column) => column.key === 'os')!,
    ];

    act(() => {
      result.current.setColumns(updatedColumns);
    });

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([
        { key: 'tags', isShown: false },
        { key: 'name', isShown: true },
        { key: 'workspace', isShown: false },
        { key: 'os', isShown: true },
      ]);
    });
  });
});
