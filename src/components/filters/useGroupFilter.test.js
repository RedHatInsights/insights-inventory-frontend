import React from 'react';
import '@testing-library/jest-dom';
import {
  act,
  render,
  renderHook,
  waitFor,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const renderWrappedHook = (
  showNoGroupOption = false,
  client = createTestQueryClient(),
) =>
  renderHook(() => useGroupFilter(showNoGroupOption), {
    wrapper: ({ children }) => (
      <QueryClientWrapper client={client}>{children}</QueryClientWrapper>
    ),
  });

/* eslint-disable react/prop-types */
function Harness({
  showNoGroupOption = false,
  client = createTestQueryClient(),
}) {
  return (
    <QueryClientWrapper client={client}>
      <WrappedHarness showNoGroupOption={showNoGroupOption} />
    </QueryClientWrapper>
  );
}

function WrappedHarness({ showNoGroupOption = false }) {
  const [config] = useGroupFilter(showNoGroupOption);
  return config.filterValues.children;
}
/* eslint-enable react/prop-types */

const waitForGroupsToBeLoaded = async (
  searchParams = { type: 'standard' },
  pageParams = { page: 1, per_page: 10 },
) =>
  await flushPromises().then(() =>
    waitFor(() =>
      expect(getGroups).toHaveBeenCalledWith(searchParams, pageParams),
    ),
  );

describe('groups request not yet resolved', () => {
  beforeEach(() => {
    getGroups.mockImplementation(() => new Promise(() => {})); // keep pending
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: true }));
  });

  it('initial values are empty', () => {
    const { result } = renderWrappedHook();

    const [, chips, value] = result.current;
    expect(chips.length).toBe(0);
    expect(value.length).toBe(0);
  });

  it('initial filter component is empty', () => {
    const { result } = renderWrappedHook();

    const [config] = result.current;
    expect(config.filterValues).toMatchInlineSnapshot(`
      {
        "children": <SearchableGroupFilter
          fetchNextPage={[Function]}
          groups={[]}
          hasNextPage={false}
          isFetchingNextPage={false}
          isLoading={true}
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

  it('filter component updated with values', async () => {
    const { result } = renderWrappedHook();
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
          isLoading={false}
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
    const { result } = renderWrappedHook();
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
    const { result } = renderWrappedHook(true);
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
          isLoading={false}
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
    const { result } = renderWrappedHook();
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
            name: 'Ungrouped hosts',
            value: '',
          },
        ],
        type: 'group_name',
      },
    ]);
  });
});

describe('filtering', () => {
  beforeAll(() => {
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: true }));
  });

  describe('local filtering (under 2 pages of data)', () => {
    beforeEach(() => {
      const total = 15; // under 2 pages of data - page size = 10
      getGroups
        .mockResolvedValueOnce({
          total,
          results: Array.from({ length: 10 }, (_, i) => ({
            name: `group-${i + 1}`,
          })),
        })
        .mockResolvedValueOnce({
          total,
          results: Array.from({ length: 5 }, (_, i) => ({
            name: `group-${i + 11}`,
          })),
        });
    });

    it('can filter groups', async () => {
      render(<Harness />);
      await act(async () => await null);
      await waitForGroupsToBeLoaded();

      const input = screen.getByPlaceholderText('Filter by workspace');
      await userEvent.type(input, 'group-12');
      await waitForGroupsToBeLoaded(
        { type: 'standard' },
        { page: 2, per_page: 10 },
      ); // Wait for the next page to load

      // There should be only one option visible (the filtered one)
      await waitFor(() =>
        expect(screen.getAllByRole('menuitem')).toHaveLength(1),
      );
      expect(
        screen.getByRole('menuitem', { name: /group-12/ }),
      ).toBeInTheDocument();
    });
  });

  describe('remote filtering (over 2 pages of data)', () => {
    beforeEach(() => {
      const total = 170; // over 2 pages of data - page size = 10
      getGroups.mockImplementation((...args) => {
        if (args[0] && args[0].name === 'group-51') {
          return Promise.resolve({
            total: 1,
            results: [{ name: 'group-51' }],
          });
        }
        const pagination = args[1] || {};
        const page = pagination.page || 1;
        const perPage = pagination.per_page || 10;
        const offset = (page - 1) * perPage;
        const results = Array.from(
          { length: Math.min(perPage, total - offset) },
          (_, i) => ({ name: `group-${offset + i + 1}` }),
        );
        return Promise.resolve({ total, results });
      });
    });

    it('can filter groups with remote search', async () => {
      render(<Harness />);
      await act(async () => await null);
      await waitForGroupsToBeLoaded();

      const input = screen.getByPlaceholderText('Filter by workspace');
      await userEvent.type(input, 'group-51');

      await waitForGroupsToBeLoaded({ name: 'group-51', type: 'standard' }); // Wait for the serach to complete

      await waitFor(() =>
        expect(screen.getAllByRole('menuitem')).toHaveLength(1),
      );

      expect(
        screen.getByRole('menuitem', { name: /group-51/ }),
      ).toBeInTheDocument();
    });
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
    renderWrappedHook(false, client);
    await flushPromises();

    expect(getGroups).not.toHaveBeenCalled();
    const data = client.getQueryState(['groups', '', false])?.data;
    expect(data).toBeUndefined();
  });
});
