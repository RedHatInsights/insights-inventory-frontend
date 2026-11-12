import { act, renderHook } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import type { ViewConfiguration } from '../../api/inventoryViewsApi';

// The platform axios instance registers responseDataInterceptor, which
// resolves requests with response.data (NOT the axios response). The mocks
// below mirror that contract — resolved values are the payloads themselves —
// so this suite fails if the hook ever goes back to destructuring `{ data }`
// off the resolved value.
jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    useAxiosWithPlatformInterceptors: () => mockAxios,
  }),
);

jest.mock('./helpers', () => ({
  buildExportRequestJson: (filters: unknown, format: unknown) => ({
    name: 'inventory-export',
    format,
    sources: [{ application: 'app', resource: 'res', filters }],
  }),
  downloadFile: jest.fn(async () => {}),
}));

const mockAxios = {
  post: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  get: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
};

// @swc/jest does not hoist jest.mock above compiled requires (unlike
// babel-jest), so the module under test must be required AFTER the mock
// registrations above.
const { useInventoryExportRequest, MAX_POLL_DURATION_MS } =
  require('./useInventoryExportRequest') as typeof import('./useInventoryExportRequest');
const { DOWNLOAD_CHECK_INTERVAL } = require('./constants') as {
  DOWNLOAD_CHECK_INTERVAL: number;
};
const { downloadFile } = require('./helpers') as {
  downloadFile: jest.Mock;
};

const configuration = {
  columns: [{ key: 'display_name' }],
} as ViewConfiguration;

describe('useInventoryExportRequest', () => {
  beforeEach(() => {
    mockAxios.post.mockReset();
    mockAxios.get.mockReset();
    downloadFile.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates, polls, and downloads an export', async () => {
    mockAxios.post.mockResolvedValue({ id: 'export-1' });
    mockAxios.get
      .mockResolvedValueOnce({ status: 'pending' })
      .mockResolvedValueOnce({ status: 'complete' });

    const { result } = renderHook(() => useInventoryExportRequest());
    const promise = result.current('csv', { configuration });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(DOWNLOAD_CHECK_INTERVAL * 2);
    });
    await expect(promise).resolves.toBeUndefined();

    expect(mockAxios.post).toHaveBeenCalledWith('/api/export/v1/exports', {
      name: 'inventory-export',
      format: 'csv',
      sources: [
        {
          application: 'app',
          resource: 'res',
          filters: { configuration },
        },
      ],
    });
    // One poll per download-check interval, at the configured cadence.
    expect(mockAxios.get).toHaveBeenCalledTimes(2);
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/api/export/v1/exports/export-1/status',
    );
    expect(downloadFile).toHaveBeenCalledWith(
      '/api/export/v1/exports/export-1',
    );
  });

  it('rejects when the export fails', async () => {
    mockAxios.post.mockResolvedValue({ id: 'export-2' });
    mockAxios.get.mockResolvedValue({ status: 'failed' });

    const { result } = renderHook(() => useInventoryExportRequest());
    const promise = result.current('json', { configuration });
    // Attach the rejection handler before advancing timers so the rejection
    // is never momentarily unhandled.
    const expectation = expect(promise).rejects.toThrow('Export failed');
    await act(async () => {
      await jest.advanceTimersByTimeAsync(DOWNLOAD_CHECK_INTERVAL);
    });
    await expectation;
    expect(downloadFile).not.toHaveBeenCalled();
  });

  it('stops polling quietly when the host unmounts mid-export', async () => {
    mockAxios.post.mockResolvedValue({ id: 'export-3' });
    mockAxios.get.mockResolvedValue({ status: 'pending' });

    const { result, unmount } = renderHook(() => useInventoryExportRequest());
    const promise = result.current('csv', {});
    unmount();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(DOWNLOAD_CHECK_INTERVAL * 3);
    });

    await expect(promise).resolves.toBeUndefined();
    expect(mockAxios.get).not.toHaveBeenCalled();
    expect(downloadFile).not.toHaveBeenCalled();
  });

  it('rejects when polling exceeds the maximum duration', async () => {
    mockAxios.post.mockResolvedValue({ id: 'export-4' });
    mockAxios.get.mockResolvedValue({ status: 'pending' });

    const { result } = renderHook(() => useInventoryExportRequest());
    const promise = result.current('csv', {});
    // Attach the rejection handler before advancing timers so the rejection
    // is never momentarily unhandled.
    const expectation = expect(promise).rejects.toThrow('Export timed out');
    await act(async () => {
      await jest.advanceTimersByTimeAsync(MAX_POLL_DURATION_MS * 2);
    });
    await expectation;
    expect(downloadFile).not.toHaveBeenCalled();
  });
});
