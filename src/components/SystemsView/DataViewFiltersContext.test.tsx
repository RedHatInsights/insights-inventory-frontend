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
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <QueryClientWrapper client={queryClient}>
      <DataViewFiltersProvider
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      >
        {children}
      </DataViewFiltersProvider>
    </QueryClientWrapper>
  );
}

function renderFiltersContext(
  initialRoute = '/',
  queryClient = createTestQueryClient(),
) {
  return renderHook(() => useDataViewFiltersContext(), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route
            path="/"
            element={
              <FiltersHarness queryClient={queryClient}>
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
});
