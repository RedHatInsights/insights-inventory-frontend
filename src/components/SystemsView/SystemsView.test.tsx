import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import React from 'react';
import {
  SystemsView,
  type SystemsViewQueryData,
  type SystemsViewQueryOptionsFn,
} from './SystemsView';
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

const successData: SystemsViewQueryData = {
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

const createQueryOptions = (
  queryFn: () => Promise<SystemsViewQueryData>,
): SystemsViewQueryOptionsFn =>
  jest.fn((params) => ({
    queryKey: [TEST_QUERY_KEY, params],
    queryFn,
  }));

const renderSystemsView = (
  queryOptions: SystemsViewQueryOptionsFn,
  client = createTestQueryClient(),
) =>
  render(
    <TestWrapper client={client}>
      <SystemsView queryOptions={queryOptions} columns={selectNameColumn} />
    </TestWrapper>,
  );

describe('SystemsView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders a column when the columns selector includes it', async () => {
    renderSystemsView(createQueryOptions(() => Promise.resolve(successData)));

    expect(
      await screen.findByRole('columnheader', { name: 'Name' }),
    ).toBeInTheDocument();
  });

  it('passes lastSeenCustomRange in fetch params', async () => {
    const queryOptions = createQueryOptions(() => Promise.resolve(successData));
    renderSystemsView(queryOptions);

    await screen.findByRole('columnheader', { name: 'Name' });

    expect(queryOptions).toHaveBeenCalledWith(
      expect.objectContaining({ lastSeenCustomRange: null }),
    );
  });

  it('shows a loading state when the query is pending', () => {
    renderSystemsView(createQueryOptions(() => new Promise(() => {})));

    expect(
      screen.getByRole('checkbox', { name: 'Select row 0' }),
    ).toBeDisabled();
    expect(screen.queryByText('Test Host')).not.toBeInTheDocument();
  });

  it('shows a loading state while a refetch is in flight', async () => {
    let hangNextFetch = false;
    const queryFn = jest.fn<() => Promise<SystemsViewQueryData>>(() =>
      hangNextFetch ? new Promise(() => {}) : Promise.resolve(successData),
    );
    const client = createTestQueryClient();

    renderSystemsView(
      () => ({
        queryKey: [TEST_QUERY_KEY],
        queryFn,
      }),
      client,
    );

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
    renderSystemsView(
      createQueryOptions(() => Promise.reject(new Error('failed to load'))),
    );

    expect(await screen.findByText(/Unable to load data/i)).toBeInTheDocument();
    expect(screen.getByText(/error retrieving data/i)).toBeInTheDocument();
    expect(screen.queryByText('Test Host')).not.toBeInTheDocument();
  });

  it('shows an empty state when the query succeeds with no systems', async () => {
    renderSystemsView(
      createQueryOptions(() => Promise.resolve({ results: [], total: 0 })),
    );

    expect(
      await screen.findByText(/No matching systems found/i),
    ).toBeInTheDocument();
  });
});
