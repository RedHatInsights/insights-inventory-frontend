import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, jest } from '@jest/globals';
import type { ApiHostGetHostListParams } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import React from 'react';
import {
  SystemsView,
  type SystemsViewFetchData,
  type SystemsViewQueryData,
} from './SystemsView';
import type {
  ActionHelpers,
  ActionSpec,
  SystemsViewRowAction,
} from './actions/types';
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

const stampHostnameDefault: FilterSelector<ApiHostGetHostListParams> = (
  catalog,
) =>
  selectLegacyInventoryFilters(catalog).map((filter) =>
    filter.filterId === 'hostname_or_id'
      ? { ...filter, defaultValue: 'web-01' }
      : filter,
  );

const renderSystemsView = <TFilterParams = unknown,>(
  fetchData: SystemsViewFetchData<System, TFilterParams>,
  client = createTestQueryClient(),
  extra?: {
    filters?: FilterSelector<TFilterParams>;
    initialRoute?: string;
    bulkActions?: readonly ActionSpec<System>[];
    rowActions?: readonly SystemsViewRowAction<System>[];
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
        bulkActions={extra?.bulkActions}
        rowActions={extra?.rowActions}
      />
    </TestWrapper>,
  );

function createPersistentAction(
  onAction: ActionSpec<System>['onAction'],
): ActionSpec<System> {
  return {
    id: 'delete',
    label: 'Delete',
    isPersistent: true,
    onAction,
  };
}

function getCalledActionHelpers(onAction: jest.Mock): ActionHelpers {
  const helpers = onAction.mock.calls.at(-1)?.[1] as ActionHelpers | undefined;
  expect(helpers).toEqual(
    expect.objectContaining({
      invalidateQuery: expect.any(Function),
      clearSelection: expect.any(Function),
    }),
  );
  return helpers as ActionHelpers;
}

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

  it('omitting filters does not fold inventory query fields', async () => {
    const fetchData = jest.fn<SystemsViewFetchData<System>>(() =>
      Promise.resolve(successData),
    );
    renderSystemsView(fetchData);

    await screen.findByRole('columnheader', { name: 'Name' });

    const { filterParams } = fetchData.mock.calls.at(-1)?.[0] ?? {};
    expect(filterParams).toEqual({});
    expect(filterParams).not.toHaveProperty('tags');
    expect(
      screen.queryByRole('button', { name: 'Status' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Tags' }),
    ).not.toBeInTheDocument();
  });

  it('an empty filter selector does not fold inventory query fields', async () => {
    const fetchData = jest.fn<SystemsViewFetchData<System>>(() =>
      Promise.resolve(successData),
    );

    renderSystemsView(fetchData, createTestQueryClient(), {
      filters: () => [],
    });

    await screen.findByRole('columnheader', { name: 'Name' });

    const { filterParams } = fetchData.mock.calls.at(-1)?.[0] ?? {};
    expect(filterParams).toEqual({});
    expect(filterParams).not.toHaveProperty('tags');
  });

  it('folds catalog.custom filters into fetch params', async () => {
    type ExtraQuery = { extra?: string };
    const fetchData = jest.fn<SystemsViewFetchData<System, ExtraQuery>>(() =>
      Promise.resolve(successData),
    );
    const filters: FilterSelector<ExtraQuery> = (catalog) => [
      catalog.custom(
        {
          type: 'text',
          filterId: 'extra',
          title: 'Extra',
          defaultValue: '',
        },
        {
          updateFilterParams: (params, value: string) => ({
            ...params,
            ...(value ? { extra: value } : {}),
          }),
        },
      ),
    ];

    renderSystemsView(fetchData, createTestQueryClient(), {
      filters,
      initialRoute: '/?extra=abc',
    });

    await screen.findByRole('columnheader', { name: 'Name' });

    expect(screen.getByRole('button', { name: 'Extra' })).toBeInTheDocument();
    expect(fetchData.mock.calls.at(-1)?.[0].filterParams).toEqual({
      extra: 'abc',
    });
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

  it('hides Reset filters when current filters match spec defaults', async () => {
    renderSystemsView(
      () => Promise.resolve(successData),
      createTestQueryClient(),
      {
        filters: stampHostnameDefault,
        initialRoute: '/?hostname_or_id=web-01',
      },
    );

    expect(await screen.findByText('Test Host')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Reset filters' }),
    ).not.toBeInTheDocument();
  });

  it('shows Reset filters after chip-X clears stamped spec defaults', async () => {
    renderSystemsView(
      () => Promise.resolve(successData),
      createTestQueryClient(),
      {
        filters: stampHostnameDefault,
        initialRoute: '/?hostname_or_id=web-01',
      },
    );

    expect(await screen.findByText('Test Host')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Reset filters' }),
    ).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /close web-01/i }));

    expect(
      await screen.findByRole('button', { name: 'Reset filters' }),
    ).toBeInTheDocument();
  });

  it('shows Reset filters when current filters differ from spec defaults', async () => {
    renderSystemsView(
      () => Promise.resolve(successData),
      createTestQueryClient(),
      {
        filters: stampHostnameDefault,
        initialRoute: '/?hostname_or_id=other-host',
      },
    );

    expect(
      await screen.findByRole('button', { name: 'Reset filters' }),
    ).toBeInTheDocument();
  });

  it('keeps Reset filters visible after chip-X removes the last filter chip', async () => {
    renderSystemsView(
      () => Promise.resolve(successData),
      createTestQueryClient(),
      {
        filters: stampHostnameDefault,
        initialRoute: '/?hostname_or_id=other-host',
      },
    );

    expect(
      await screen.findByRole('button', { name: 'Reset filters' }),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /close other-host/i }));

    expect(
      await screen.findByRole('button', { name: 'Reset filters' }),
    ).toBeInTheDocument();
  });

  it('omits bulk and row actions when action props are omitted', async () => {
    renderSystemsView(() => Promise.resolve(successData));

    expect(await screen.findByText('Test Host')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /kebab toggle/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: /actions/i }),
    ).not.toBeInTheDocument();
  });

  it('omits bulk and row actions when action props are empty arrays', async () => {
    renderSystemsView(
      () => Promise.resolve(successData),
      createTestQueryClient(),
      { bulkActions: [], rowActions: [] },
    );

    expect(await screen.findByText('Test Host')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /kebab toggle/i }),
    ).not.toBeInTheDocument();
  });

  it('calls bulk onAction with selected items and actionHelpers', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();

    renderSystemsView(
      () => Promise.resolve(successData),
      createTestQueryClient(),
      { bulkActions: [createPersistentAction(onAction)] },
    );

    expect(await screen.findByText('Test Host')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Select row 0' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          id: mockSystem.id,
          display_name: mockSystem.display_name,
        }),
      ],
      expect.objectContaining({
        invalidateQuery: expect.any(Function),
        clearSelection: expect.any(Function),
      }),
    );
  });

  it('calls row onAction with the row item and actionHelpers', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();

    renderSystemsView(
      () => Promise.resolve(successData),
      createTestQueryClient(),
      {
        rowActions: [{ id: 'delete', label: 'Delete', onAction }],
      },
    );

    expect(await screen.findByText('Test Host')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /kebab toggle/i }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(onAction).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          id: mockSystem.id,
          display_name: mockSystem.display_name,
        }),
      ],
      expect.objectContaining({
        invalidateQuery: expect.any(Function),
        clearSelection: expect.any(Function),
      }),
    );
  });

  it('invalidates the table query by queryKeyPrefix when actionHelpers.invalidateQuery runs', async () => {
    const fetchData = jest.fn<SystemsViewFetchData<System>>(() =>
      Promise.resolve(successData),
    );
    const onAction = jest.fn();
    const client = createTestQueryClient();
    const invalidateSpy = jest.spyOn(client, 'invalidateQueries');
    const user = userEvent.setup();

    renderSystemsView(fetchData, client, {
      bulkActions: [createPersistentAction(onAction)],
    });

    expect(await screen.findByText('Test Host')).toBeInTheDocument();
    const fetchCountAfterLoad = fetchData.mock.calls.length;

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const helpers = getCalledActionHelpers(onAction);

    await act(async () => {
      await helpers.invalidateQuery();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [TEST_QUERY_KEY],
    });
    await waitFor(() => {
      expect(fetchData.mock.calls.length).toBeGreaterThan(fetchCountAfterLoad);
    });
  });

  it('clears bulk selection when actionHelpers.clearSelection runs', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();

    renderSystemsView(
      () => Promise.resolve(successData),
      createTestQueryClient(),
      { bulkActions: [createPersistentAction(onAction)] },
    );

    expect(await screen.findByText('Test Host')).toBeInTheDocument();
    const rowCheckbox = screen.getByRole('checkbox', { name: 'Select row 0' });
    await user.click(rowCheckbox);

    expect(rowCheckbox).toBeChecked();
    expect(screen.getByText('1 selected')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const helpers = getCalledActionHelpers(onAction);

    act(() => {
      helpers.clearSelection();
    });

    expect(rowCheckbox).not.toBeChecked();
    expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
  });
});
