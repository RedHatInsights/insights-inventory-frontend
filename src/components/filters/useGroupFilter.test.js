import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  QueryClientWrapper,
  createTestQueryClient,
  flushPromises,
} from '../../Utilities/TestingUtilities';
import useGroupFilter from './useGroupFilter';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { getGroups } from '../InventoryGroups/utils/api';

jest.mock('../InventoryGroups/utils/api', () => ({
  __esModule: true,
  getGroups: jest.fn(),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    __esModule: true,
    usePermissionsWithContext: jest.fn(),
  }),
);

const render = (showNoGroupOption = false, client = createTestQueryClient()) =>
  renderHook(() => useGroupFilter(showNoGroupOption), {
    wrapper: ({ children }) => (
      <QueryClientWrapper client={client}>{children}</QueryClientWrapper>
    ),
  });

describe('groups request not yet resolved', () => {
  beforeEach(() => {
    getGroups.mockImplementation(() => new Promise(() => {})); // keep pending
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: true }));
  });

  it('initial values are empty', () => {
    const { result } = render();

    const [, chips, value] = result.current;
    expect(chips.length).toBe(0);
    expect(value.length).toBe(0);
  });

  it('initial filter component is empty', () => {
    const { result } = render();

    const [config] = result.current;
    expect(config.filterValues).toMatchInlineSnapshot(`
      {
        "children": <SearchableGroupFilter
          fetchNextPage={[Function]}
          groups={[]}
          hasNextPage={false}
          isFetchingNextPage={false}
          isKesselEnabled={false}
          searchQuery=""
          selectedGroupNames={[]}
          setSearchQuery={[Function]}
          setSelectedGroupNames={[Function]}
          showNoGroupOption={false}
        />,
      }
    `);
  });
});

describe('with some groups available', () => {
  beforeAll(() => {
    getGroups.mockResolvedValue({ total: 1, results: [{ name: 'group-1' }] });
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: true }));
  });

  beforeEach(() => {
    getGroups.mockClear();
  });

  const waitForGroupsToBeLoaded = async () =>
    await flushPromises().then(() =>
      waitFor(() => expect(getGroups).toHaveBeenCalled()),
    );

  it('filter component updated with values', async () => {
    const { result } = render();
    await waitForGroupsToBeLoaded();

    const [config] = result.current;
    expect(config.filterValues).toMatchInlineSnapshot(`
      {
        "children": <SearchableGroupFilter
          fetchNextPage={[Function]}
          groups={
            [
              {
                "name": "group-1",
              },
            ]
          }
          hasNextPage={false}
          isFetchingNextPage={false}
          isKesselEnabled={false}
          searchQuery=""
          selectedGroupNames={[]}
          setSearchQuery={[Function]}
          setSelectedGroupNames={[Function]}
          showNoGroupOption={false}
        />,
      }
    `);
  });

  it('can use setter', async () => {
    const { result } = render();
    await waitForGroupsToBeLoaded();

    const [, , , setValue] = result.current;
    act(() => {
      setValue(['group-1']);
    });
    const [, chips, value] = result.current;
    expect(chips.length).toBe(1);
    expect(value).toEqual(['group-1']);
    expect(chips).toMatchObject([
      {
        category: 'Workspace',
        chips: [
          {
            name: 'group-1',
            value: 'group-1',
          },
        ],
        type: 'group_name',
      },
    ]);
  });

  it('can enable no group option', async () => {
    const { result } = render(true);
    await waitForGroupsToBeLoaded();

    const [config] = result.current;
    expect(config.filterValues).toMatchInlineSnapshot(`
      {
        "children": <SearchableGroupFilter
          fetchNextPage={[Function]}
          groups={
            [
              {
                "name": "group-1",
              },
            ]
          }
          hasNextPage={false}
          isFetchingNextPage={false}
          isKesselEnabled={false}
          searchQuery=""
          selectedGroupNames={[]}
          setSearchQuery={[Function]}
          setSelectedGroupNames={[Function]}
          showNoGroupOption={true}
        />,
      }
    `);
  });

  it('can select no group option', async () => {
    const { result } = render();
    await waitForGroupsToBeLoaded();

    const [, , , setValue] = result.current;
    act(() => {
      setValue(['']);
    });
    const [, chips, value] = result.current;
    expect(chips.length).toBe(1);
    expect(value).toEqual(['']);
    expect(chips).toMatchObject([
      {
        category: 'Workspace',
        chips: [
          {
            name: 'No workspace',
            value: '',
          },
        ],
        type: 'group_name',
      },
    ]);
  });
});

describe('no groups:read permission', () => {
  beforeAll(() => {
    getGroups.mockClear();
    getGroups.mockResolvedValue({ total: 1, results: [{ name: 'group-1' }] });
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: false }));
  });

  it('returns no groups', async () => {
    const client = createTestQueryClient();
    render(false, client);
    await flushPromises();

    expect(getGroups).not.toHaveBeenCalled();
    const { data } = client.getQueryState(['groups', false]);
    expect(data).toBeUndefined();
  });
});
