import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import React from 'react';
import { SystemsView, type UseSystemsViewDataQuery } from './SystemsView';
import type { OnInvalidate } from './SystemActionModalsContext';
import type { ColumnSelector } from './columns/resolveColumnSelector';
import type { System } from '../InventoryViews/hooks/useHostsQuery';
import { TestWrapper } from '../../Utilities/TestingUtilities';

const mockSystem = {
  id: 'host-1',
  display_name: 'Test Host',
} as System;

const mockUseDataQuery = jest.fn<UseSystemsViewDataQuery>(() => ({
  data: [mockSystem],
  total: 1,
  isLoading: false,
  isFetching: false,
  isError: false,
}));

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
  allColumns.filter((column) => column.key === 'name');

const renderSystemsView = () =>
  render(
    <TestWrapper>
      <SystemsView
        useDataQuery={mockUseDataQuery}
        onInvalidate={jest.fn<OnInvalidate>()}
        columns={selectNameColumn}
      />
    </TestWrapper>,
  );

describe('SystemsView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockUseDataQuery.mockImplementation(() => ({
      data: [mockSystem],
      total: 1,
      isLoading: false,
      isFetching: false,
      isError: false,
    }));
  });

  it('renders a column when the columns selector includes it', async () => {
    renderSystemsView();

    expect(
      await screen.findByRole('columnheader', { name: 'Name' }),
    ).toBeInTheDocument();
  });

  it('shows a loading state when isLoading is true', () => {
    mockUseDataQuery.mockImplementation(() => ({
      data: undefined,
      total: undefined,
      isLoading: true,
      isFetching: false,
      isError: false,
    }));

    renderSystemsView();

    expect(
      screen.getByRole('checkbox', { name: 'Select row 0' }),
    ).toBeDisabled();
    expect(
      screen.queryByRole('cell', { name: 'Test Host' }),
    ).not.toBeInTheDocument();
  });

  it('shows a loading state when isFetching is true', () => {
    mockUseDataQuery.mockImplementation(() => ({
      data: [mockSystem],
      total: 1,
      isLoading: false,
      isFetching: true,
      isError: false,
    }));

    renderSystemsView();

    expect(
      screen.getByRole('checkbox', { name: 'Select row 0' }),
    ).toBeDisabled();
    expect(
      screen.queryByRole('cell', { name: 'Test Host' }),
    ).not.toBeInTheDocument();
  });

  it('shows an error state when isError is true', () => {
    mockUseDataQuery.mockImplementation(() => ({
      data: [],
      total: 0,
      isLoading: false,
      isFetching: false,
      isError: true,
    }));

    renderSystemsView();

    expect(screen.getByText(/Unable to load data/i)).toBeInTheDocument();
    expect(screen.getByText(/error retrieving data/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('cell', { name: 'Test Host' }),
    ).not.toBeInTheDocument();
  });
});
