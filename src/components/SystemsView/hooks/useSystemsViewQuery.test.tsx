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

const laterPage = { ...fetchParams, page: 5 };

const renderQuery = (
  client: QueryClient,
  fetchData: SystemsViewFetchData<{ id: string }>,
  params = fetchParams,
) =>
  renderHook(
    () =>
      useSystemsViewQuery({
        queryKeyPrefix: 'systems',
        fetchData,
        fetchParams: params,
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

  it('retries a failed page-one probe without requesting the later page again', async () => {
    const fetchData = jest.fn<SystemsViewFetchData<{ id: string }>>(() =>
      Promise.reject(new Error('failed to load')),
    );
    const client = clientWithoutRetryDefault();
    client.setQueryDefaults(['systems'], { retry: 2 });

    const { result } = renderQuery(client, fetchData, laterPage);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(fetchData.mock.calls.map(([params]) => params.page)).toEqual([
      5, 1, 1, 1,
    ]);
  });

  it('retries the original page after the probe shows it is in range', async () => {
    const fetchData = jest.fn<SystemsViewFetchData<{ id: string }>>(
      ({ page }) =>
        page === 1
          ? Promise.resolve({ results: [], total: 250 })
          : Promise.reject(new Error('failed to load')),
    );
    const client = clientWithoutRetryDefault();
    client.setQueryDefaults(['systems'], { retry: 1 });

    const { result } = renderQuery(client, fetchData, laterPage);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(fetchData.mock.calls.map(([params]) => params.page)).toEqual([
      5, 1, 5, 1,
    ]);
  });
});
