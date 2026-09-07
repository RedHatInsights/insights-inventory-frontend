import '@testing-library/jest-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router-dom';
import { expect, jest } from '@jest/globals';
import {
  DataViewFiltersProvider,
  INITIAL_INVENTORY_FILTERS,
  useDataViewFiltersContext,
} from './DataViewFiltersContext';
import {
  hostnameSpec,
  inventoryFilterSpecs,
  statusSpec,
  tagsSpec,
} from './filters/inventory/filterDefinitions';
import type { FilterSpec } from './filters/types';
import type { InventoryFilters } from './filters/SystemsViewFilters';
import {
  QueryClientWrapper,
  createTestQueryClient,
  flushPromises,
} from '../../Utilities/TestingUtilities';

jest.mock('../../Utilities/hooks/useConditionalRBAC', () => ({
  useConditionalRBAC: jest.fn(() => ({ hasAccess: true, isOrgAdmin: false })),
}));

function FiltersHarness({
  children,
  queryClient,
  resolvedFilters = inventoryFilterSpecs,
  defaultFilters,
  initialFilters,
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
  resolvedFilters?: readonly FilterSpec[];
  defaultFilters?: Partial<InventoryFilters>;
  initialFilters?: Partial<InventoryFilters>;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <QueryClientWrapper client={queryClient}>
      <DataViewFiltersProvider
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        resolvedFilters={resolvedFilters}
        defaultFilters={defaultFilters}
        initialFilters={initialFilters}
      >
        {children}
      </DataViewFiltersProvider>
    </QueryClientWrapper>
  );
}

function renderFiltersContext(
  initialRoute = '/',
  queryClient = createTestQueryClient(),
  resolvedFilters: readonly FilterSpec[] = inventoryFilterSpecs,
  extras: {
    defaultFilters?: Partial<InventoryFilters>;
    initialFilters?: Partial<InventoryFilters>;
  } = {},
) {
  return renderHook(() => useDataViewFiltersContext(), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route
            path="/"
            element={
              <FiltersHarness
                queryClient={queryClient}
                resolvedFilters={resolvedFilters}
                defaultFilters={extras.defaultFilters}
                initialFilters={extras.initialFilters}
              >
                {children}
              </FiltersHarness>
            }
          />
        </Routes>
      </MemoryRouter>
    ),
  });
}

const LAST_SEEN_CUSTOM_RANGE = {
  start: '2024-01-01T00:00:00.000Z',
  end: '2024-01-31T23:59:59.999Z',
};

describe('useDataViewFiltersContext', () => {
  it('throws when used outside DataViewFiltersProvider', () => {
    expect(() => renderHook(() => useDataViewFiltersContext())).toThrow(
      'useDataViewFiltersContext must be used within DataViewFiltersProvider',
    );
  });
});

describe('DataViewFiltersProvider', () => {
  it('exposes the resolved filter list passed into the provider', () => {
    const { result } = renderFiltersContext();

    expect(result.current.resolvedFilters).toEqual(inventoryFilterSpecs);
  });

  it('normalizes invalid last_seen values from URL to empty string', async () => {
    const { result } = renderFiltersContext('/?last_seen=not-a-valid-key');

    await waitFor(() => {
      expect(result.current.filters.last_seen).toBe('');
    });
  });

  it('clears lastSeenCustomRange when last_seen is no longer custom', async () => {
    const { result } = renderFiltersContext('/?last_seen=custom');

    act(() => {
      result.current.setLastSeenCustomRange(LAST_SEEN_CUSTOM_RANGE);
    });

    act(() => {
      result.current.onSetFilters({ last_seen: 'last24' });
    });

    await waitFor(() => {
      expect(result.current.lastSeenCustomRange).toBeNull();
      expect(result.current.filters.last_seen).toBe('last24');
    });
  });

  it('clearAllFilters clears the custom last-seen range and resets filter state', async () => {
    const { result } = renderFiltersContext('/?last_seen=custom&status=fresh');

    act(() => {
      result.current.setLastSeenCustomRange({
        start: '2024-06-01T00:00:00.000Z',
        end: '2024-06-30T23:59:59.999Z',
      });
    });

    act(() => {
      result.current.clearAllFilters();
    });

    await waitFor(() => {
      expect(result.current.lastSeenCustomRange).toBeNull();
      expect(result.current.filters).toEqual(INITIAL_INVENTORY_FILTERS);
    });
  });

  it('replaces empty group_id with ungrouped workspace UUID when the id loads', async () => {
    const ungroupedWorkspaceId = 'ungrouped-kessel-uuid';
    const queryClient = createTestQueryClient();
    const { result } = renderFiltersContext('/?group_id=', queryClient);

    await waitFor(() => {
      expect(result.current.filters.group_id).toEqual(['']);
    });
    expect(result.current.ungroupedWorkspaceId).toBeUndefined();

    queryClient.setQueryData(
      ['groups', 'ungrouped-hosts-workspace'],
      ungroupedWorkspaceId,
    );
    await act(async () => {
      await flushPromises();
    });

    await waitFor(() => {
      expect(result.current.ungroupedWorkspaceId).toBe(ungroupedWorkspaceId);
      expect(result.current.filters.group_id).toEqual([ungroupedWorkspaceId]);
    });
  });

  it('initializes only keys from the resolved spec list', () => {
    const { result } = renderFiltersContext('/', createTestQueryClient(), [
      hostnameSpec,
      statusSpec,
    ]);

    expect(result.current.filters).toEqual({
      hostname_or_id: '',
      status: [],
    });
    expect(result.current.filters).not.toHaveProperty('tags');
  });

  it('adds a URL key to empty state when that spec is included', () => {
    const { result } = renderFiltersContext('/', createTestQueryClient(), [
      hostnameSpec,
      statusSpec,
      tagsSpec,
    ]);

    expect(result.current.filters).toEqual({
      hostname_or_id: '',
      status: [],
      tags: [],
    });
  });

  it('merges initialFilters onto spec empty values', () => {
    const { result } = renderFiltersContext(
      '/',
      createTestQueryClient(),
      [hostnameSpec, statusSpec],
      { initialFilters: { hostname_or_id: 'web-01' } },
    );

    expect(result.current.filters).toEqual({
      hostname_or_id: 'web-01',
      status: [],
    });
  });

  it('clearAllFilters resets only resolved spec keys', async () => {
    const { result } = renderFiltersContext(
      '/?hostname_or_id=foo&status=fresh&tags=env%3Dprod',
      createTestQueryClient(),
      [hostnameSpec, statusSpec],
    );

    await waitFor(() => {
      expect(result.current.filters.hostname_or_id).toBe('foo');
      expect(result.current.filters.status).toEqual(['fresh']);
    });
    expect(result.current.filters).not.toHaveProperty('tags');

    act(() => {
      result.current.clearAllFilters();
    });

    await waitFor(() => {
      expect(result.current.filters).toEqual({
        hostname_or_id: '',
        status: [],
      });
    });
  });

  it('clearAllFilters merges defaultFilters onto spec empty values', async () => {
    const { result } = renderFiltersContext(
      '/?hostname_or_id=foo&status=fresh',
      createTestQueryClient(),
      [hostnameSpec, statusSpec],
      { defaultFilters: { status: ['stale'] } },
    );

    act(() => {
      result.current.clearAllFilters();
    });

    await waitFor(() => {
      expect(result.current.filters).toEqual({
        hostname_or_id: '',
        status: ['stale'],
      });
    });
  });
});
