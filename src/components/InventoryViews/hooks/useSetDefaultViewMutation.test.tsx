import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSetDefaultViewMutation } from './useSetDefaultViewMutation';
import { setDefaultViewApi } from '../../../api/inventoryViewsApi';

const mockAddNotification = jest.fn();

jest.mock('../../../api/inventoryViewsApi', () => ({
  setDefaultViewApi: jest.fn(),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/hooks',
  () => ({
    useAddNotification: () => mockAddNotification,
  }),
);

const mockedSetDefaultViewApi = setDefaultViewApi as unknown as jest.Mock;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper, invalidateSpy };
};

describe('useSetDefaultViewMutation', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls the API and fires a success toast with the view name, then invalidates the views query', async () => {
    mockedSetDefaultViewApi.mockResolvedValue({
      id: 'view-1',
      name: 'My Pinned View',
    });
    const { wrapper, invalidateSpy } = createWrapper();

    const { result } = renderHook(() => useSetDefaultViewMutation(), {
      wrapper,
    });

    result.current.mutate('view-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedSetDefaultViewApi).toHaveBeenCalledWith('view-1');
    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'success',
        title: '"My Pinned View" is now your default view',
      }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['views'] });
  });

  it('fires a danger toast with the error message when the request fails', async () => {
    mockedSetDefaultViewApi.mockRejectedValue(new Error('boom'));
    const { wrapper, invalidateSpy } = createWrapper();

    const { result } = renderHook(() => useSetDefaultViewMutation(), {
      wrapper,
    });

    result.current.mutate('view-1');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to set default view',
        description: 'boom',
      }),
    );
    // No cache invalidation on failure.
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
