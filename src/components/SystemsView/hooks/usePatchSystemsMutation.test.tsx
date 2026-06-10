import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { jest, expect } from '@jest/globals';
import type { patchHostById } from '../../../api/hostInventoryApiTyped';
import type { invalidateSystemsViewQueries } from '../utils/invalidateSystemsViewQueries';
import type { System } from './useSystemsQuery';

const mockPatchHostById = jest.fn<typeof patchHostById>();
const mockInvalidateSystemsViewQueries =
  jest.fn<typeof invalidateSystemsViewQueries>();

jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/hooks',
  () => ({
    useAddNotification: () => jest.fn(),
  }),
);

jest.mock('../../../api/hostInventoryApiTyped', () => ({
  patchHostById: mockPatchHostById,
}));

jest.mock('../utils/invalidateSystemsViewQueries', () => ({
  invalidateSystemsViewQueries: mockInvalidateSystemsViewQueries,
}));

const { usePatchSystemsMutation } =
  require('./usePatchSystemsMutation') as typeof import('./usePatchSystemsMutation');

const mockSystem: Pick<System, 'id' | 'display_name'> = {
  id: 'system-1',
  display_name: 'old-name',
};

interface QueryClientTestWrapperProps {
  children: React.ReactNode;
}

function createWrapper(queryClient: QueryClient) {
  function QueryClientTestWrapper({ children }: QueryClientTestWrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  QueryClientTestWrapper.displayName = 'QueryClientTestWrapper';

  return QueryClientTestWrapper;
}

describe('usePatchSystemsMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPatchHostById.mockResolvedValue(
      {} as Awaited<ReturnType<typeof patchHostById>>,
    );
    mockInvalidateSystemsViewQueries.mockResolvedValue([
      undefined,
      undefined,
    ] as Awaited<ReturnType<typeof invalidateSystemsViewQueries>>);
  });

  it('refetches table data by invalidating systems view queries on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const { result } = renderHook(
      () => usePatchSystemsMutation({ systems: [mockSystem as System] }),
      { wrapper: createWrapper(queryClient) },
    );

    result.current.onPatchConfirm('new-name');

    await waitFor(() => {
      expect(mockPatchHostById).toHaveBeenCalledWith({
        hostIdList: ['system-1'],
        patchHostIn: { display_name: 'new-name' },
      });
    });

    await waitFor(() => {
      expect(mockInvalidateSystemsViewQueries).toHaveBeenCalledWith(
        queryClient,
      );
    });
  });
});
