import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import React from 'react';
import { SystemsView, type SystemsViewQueryData } from './SystemsView';
import type { SystemsViewFetchData } from './types';
import type { InventoryFilters } from './filters/SystemsViewFilters';
import type { ColumnSelector } from './columns/resolveColumnSelector';
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

const selectNameColumn: ColumnSelector = (allColumns) =>
  allColumns.filter((column) => column.key === 'display_name');

const renderSystemsView = (
  fetchData: SystemsViewFetchData<System, InventoryFilters>,
  client = createTestQueryClient(),
) =>
  render(
    <TestWrapper client={client}>
      <SystemsView
        queryKeyPrefix={TEST_QUERY_KEY}
        fetchData={fetchData}
        columns={selectNameColumn}
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

  it('passes lastSeenCustomRange in fetch params', async () => {
    const fetchData = jest.fn<SystemsViewFetchData<System, InventoryFilters>>(
      () => Promise.resolve(successData),
    );
    renderSystemsView(fetchData);

    await screen.findByRole('columnheader', { name: 'Name' });

    expect(fetchData).toHaveBeenCalledWith(
      expect.objectContaining({ lastSeenCustomRange: null }),
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
    const fetchData = jest.fn<SystemsViewFetchData<System, InventoryFilters>>(
      () =>
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
