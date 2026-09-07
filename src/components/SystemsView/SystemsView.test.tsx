import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import type { ApiHostGetHostListParams } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import React from 'react';
import {
  SystemsView,
  type SystemsViewFetchData,
  type SystemsViewQueryData,
} from './SystemsView';
import type { ColumnSelector } from './columns/resolveColumnSelector';
import type { FilterSelector } from './filters/resolveFilterSelector';
import { bindInventoryViewColumns } from './columns/inventoryViewColumns';
import { selectLegacyInventoryFilters } from '../InventoryViews/selectLegacyInventoryFilters';
import type { System } from '../InventoryViews/hostsQueryOptions';
import {
  createTestQueryClient,
  TestWrapper,
} from '../../Utilities/TestingUtilities';

const TEST_QUERY_KEY = 'systems-view-test' as const;

const mockSystem = {
  id: 'host-1',
  display_name: 'Test Host',
} as System;

const successData: SystemsViewQueryData<System> = {
  results: [mockSystem],
  total: 1,
};

jest.mock('../../Utilities/hooks/useHostIdsWithKessel', () => ({
  useHostIdsWithKessel: (hosts: System[] | undefined) => ({
    hostIds: [],
    isKesselEnabled: false,
    hostsWithPermissions: hosts,
    permissionsLoading: false,
    permissionsError: null,
  }),
}));

jest.mock('../../Utilities/useInventoryViewsFeatureFlag', () => ({
  __esModule: true,
  default: () => false,
}));

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    auth: {
      getUser: () =>
        Promise.resolve({
          identity: {
            account_number: '1234567',
            type: 'User',
            user: { username: 'systems-view-test-user', is_org_admin: true },
          },
        }),
    },
  }),
}));

jest.mock('../../Utilities/useFeatureFlag', () => ({
  __esModule: true,
  default: jest.fn(() => false),
}));

const selectNameColumn: ColumnSelector<System> = () =>
  bindInventoryViewColumns().filter((column) => column.key === 'display_name');

const renderSystemsView = <TQuery = unknown,>(
  fetchData: SystemsViewFetchData<System, TQuery>,
  client = createTestQueryClient(),
  extra?: {
    filters?: FilterSelector<TQuery>;
    initialRoute?: string;
  },
) =>
  render(
    <TestWrapper
      client={client}
      routerProps={{ initialEntries: [extra?.initialRoute ?? '/'] }}
    >
      <SystemsView
        queryKeyPrefix={TEST_QUERY_KEY}
        fetchData={fetchData}
        columns={selectNameColumn}
        filters={extra?.filters}
      />
    </TestWrapper>,
  );

describe('SystemsView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders a column when the columns selector includes it', async () => {
    renderSystemsView(() => Promise.resolve(successData));

    expect(
      await screen.findByRole('columnheader', { name: 'Name' }),
    ).toBeInTheDocument();
  });

  it('passes folded query in fetch params', async () => {
    const fetchData = jest.fn<SystemsViewFetchData<System>>(() =>
      Promise.resolve(successData),
    );
    renderSystemsView(fetchData);

    await screen.findByRole('columnheader', { name: 'Name' });

    expect(fetchData).toHaveBeenCalledWith(
      expect.objectContaining({
        filterParams: expect.any(Object),
      }),
    );
    expect(fetchData.mock.calls[0][0]).not.toHaveProperty(
      'lastSeenCustomRange',
    );
  });

  it('omitting filters folds the full inventory query', async () => {
    const fetchData = jest.fn<SystemsViewFetchData<System>>(() =>
      Promise.resolve(successData),
    );
    renderSystemsView(fetchData);

    await screen.findByRole('columnheader', { name: 'Name' });

    const { filterParams } = fetchData.mock.calls.at(-1)?.[0] ?? {};
    expect(filterParams).toHaveProperty('tags');
  });

  it('dropping a factory from the filter selector omits that query field', async () => {
    const fetchData = jest.fn<
      SystemsViewFetchData<System, ApiHostGetHostListParams>
    >(() => Promise.resolve(successData));
    const filters: FilterSelector<ApiHostGetHostListParams> = (catalog) =>
      selectLegacyInventoryFilters(catalog).filter(
        (filter) => filter.filterId !== 'tags',
      );

    renderSystemsView(fetchData, createTestQueryClient(), {
      filters,
      initialRoute: '/?tags=namespace/key=value&status=fresh',
    });

    await screen.findByRole('columnheader', { name: 'Name' });

    const { filterParams } = fetchData.mock.calls.at(-1)?.[0] ?? {};
    expect(filterParams).not.toHaveProperty('tags');
    expect(filterParams).toEqual(
      expect.objectContaining({ staleness: ['fresh'] }),
    );
  });

  it('shows a loading state when the query is pending', () => {
    renderSystemsView(() => new Promise(() => {}));

    expect(
      screen.getByRole('checkbox', { name: 'Select row 0' }),
    ).toBeDisabled();
    expect(screen.queryByText('Test Host')).not.toBeInTheDocument();
  });

  it('shows a loading state while a refetch is in flight', async () => {
    let hangNextFetch = false;
    const fetchData = jest.fn<SystemsViewFetchData<System>>(() =>
      hangNextFetch ? new Promise(() => {}) : Promise.resolve(successData),
    );
    const client = createTestQueryClient();

    renderSystemsView(fetchData, client);

    expect(await screen.findByText('Test Host')).toBeInTheDocument();

    hangNextFetch = true;
    act(() => {
      void client.invalidateQueries({ queryKey: [TEST_QUERY_KEY] });
    });

    await waitFor(() => {
      expect(
        screen.getByRole('checkbox', { name: 'Select row 0' }),
      ).toBeDisabled();
    });
    expect(screen.queryByText('Test Host')).not.toBeInTheDocument();
  });

  it('shows an error state when the query fails', async () => {
    renderSystemsView(() => Promise.reject(new Error('failed to load')));

    expect(await screen.findByText(/Unable to load data/i)).toBeInTheDocument();
    expect(screen.getByText(/error retrieving data/i)).toBeInTheDocument();
    expect(screen.queryByText('Test Host')).not.toBeInTheDocument();
  });

  it('shows an empty state when the query succeeds with no systems', async () => {
    renderSystemsView(() => Promise.resolve({ results: [], total: 0 }));

    expect(
      await screen.findByText(/No matching systems found/i),
    ).toBeInTheDocument();
  });
});
