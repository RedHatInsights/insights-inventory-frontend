import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import type { SetURLSearchParams } from 'react-router-dom';
import type { SystemsViewFetchData } from '../types';
import { useSystemsViewQuery } from './useSystemsViewQuery';

const fetchParams = {
  page: 1,
  perPage: 50,
  sortBy: 'display_name',
  direction: 'asc' as const,
  filterParams: {},
};

const renderQuery = (
  client: QueryClient,
  fetchData: SystemsViewFetchData<{ id: string }>,
) =>
  renderHook(
    () =>
      useSystemsViewQuery({
        queryKeyPrefix: 'systems',
        fetchData,
        fetchParams,
        setSearchParams: jest.fn<SetURLSearchParams>(),
      }),
    {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    },
  );

const clientWithoutRetryDefault = () =>
  new QueryClient({
    defaultOptions: { queries: { gcTime: 0, retryDelay: 0 } },
  });

describe('useSystemsViewQuery retry policy', () => {
  it('uses a retry policy registered for the query key prefix', async () => {
    const fetchData = jest.fn<SystemsViewFetchData<{ id: string }>>(() =>
      Promise.reject(new Error('failed to load')),
    );
    const client = clientWithoutRetryDefault();
    client.setQueryDefaults(['systems'], { retry: false });

    const { result } = renderQuery(client, fetchData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(fetchData).toHaveBeenCalledTimes(1);
  });
});
