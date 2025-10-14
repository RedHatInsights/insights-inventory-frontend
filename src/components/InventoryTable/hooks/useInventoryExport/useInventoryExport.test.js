import 'node-fetch';
import { renderHook, waitFor } from '@testing-library/react';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import {
  DOWNLOAD_CHECK_INTERVAL,
  EXPORT_SERVICE_APPLICATON,
  EXPORT_SERVICE_RESOURCE,
  EXPORT_SERVICE_PATH,
} from './constants';
import exports from '../../../../__factories__/exports';
import useInventoryExport from './useInventoryExport';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

jest.mock('@redhat-cloud-services/frontend-components-utilities/interceptors');
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));
jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/hooks',
  () => ({
    ...jest.requireActual(
      '@redhat-cloud-services/frontend-components-notifications/hooks',
    ),
    useAddNotification: jest.fn(),
  }),
);

const FORMATS = ['json', 'csv'];
const FORMAT = FORMATS[Math.floor(Math.random() * FORMATS.length)];
const ERROR_NOTIFICATION = {
  id: 'inventory-export-error',
  title: 'The requested export could not be created. Please try again.',
  variant: 'danger',
};

const exportObjects = exports(1, { status: 'complete' });
const exampleGetResponse = {
  data: exportObjects,
  links: {
    first: 'string',
    next: 'string',
    previous: 'string',
    last: 'string',
  },
  meta: {
    count: exportObjects.length,
  },
};

describe('useInventoryExport', () => {
  const notificationMock = jest.fn();
  const axiosPostMock = jest.fn(async () => exampleGetResponse.data[0]);
  const axiosGetMock = jest.fn(async (url) => {
    if (url === EXPORT_SERVICE_PATH + '/exports') {
      return exampleGetResponse;
    }

    if (
      url ===
      EXPORT_SERVICE_PATH +
        '/exports/' +
        exampleGetResponse.data[0].id +
        '/status'
    ) {
      return exampleGetResponse.data[0];
    }
  });

  let origfetch = global.fetch;
  let origURL = global.URL;

  beforeEach(() => {
    jest.clearAllMocks();

    useAddNotification.mockImplementation(() => notificationMock);
    useAxiosWithPlatformInterceptors.mockImplementation(() => ({
      post: axiosPostMock,
      get: axiosGetMock,
    }));

    global.fetch = async () => ({
      blob: async () => ({}),
      headers: {
        get: () =>
          'attachment; filename="2024-09-12T12:27:59Z-sd-ed92-4ff9-a23f-sad.zip"',
      },
    });
    global.URL.createObjectURL = jest.fn(() => 'details');
  });

  afterEach(() => {
    global.fetch = origfetch;
    global.URL = origURL;
    jest.useRealTimers();
  });

  it('should return an onSelect function', () => {
    const { result } = renderHook(() => useInventoryExport());

    expect(result.current.onSelect).toBeDefined();
  });

  it('should call the API onSelect for ' + FORMAT.toUpperCase(), async () => {
    jest.useFakeTimers({ advanceTimers: true });
    const { result } = renderHook(() => useInventoryExport());

    result.current.onSelect(undefined, FORMAT);

    await waitFor(() => {
      return expect(axiosPostMock).toHaveBeenNthCalledWith(
        1,
        EXPORT_SERVICE_PATH + '/exports',
        {
          format: FORMAT,
          name: 'inventory-export',
          sources: [
            {
              application: EXPORT_SERVICE_APPLICATON,
              filters: {},
              resource: EXPORT_SERVICE_RESOURCE,
            },
          ],
        },
      );
    });

    expect(notificationMock).toHaveBeenCalledWith({
      id: 'inventory-export-success',
      title:
        'The requested export is being prepared. When ready, the download will start automatically.',
      variant: 'info',
    });
    jest.clearAllMocks();
    jest.advanceTimersByTime(DOWNLOAD_CHECK_INTERVAL * 2);

    await waitFor(() =>
      expect(axiosGetMock).toHaveBeenCalledWith(
        EXPORT_SERVICE_PATH +
          '/exports/' +
          exampleGetResponse.data[0].id +
          '/status',
      ),
    );

    expect(notificationMock).toHaveBeenCalledWith({
      id: 'inventory-export-download',
      title: 'The requested export is being downloaded.',
      variant: 'success',
    });
  });

  it('should disable the button after initiating an export', async () => {
    jest.useFakeTimers({ advanceTimers: true });
    const { result } = renderHook(() => useInventoryExport());

    result.current.onSelect(undefined, FORMAT);

    await waitFor(() => expect(result.current.isDisabled).toBe(true));

    await waitFor(() => expect(axiosPostMock).toHaveBeenCalled());

    await waitFor(() => expect(result.current.isDisabled).toBe(false));
  });

  it(
    'should trigger a notification when a export has a failed status for ' +
      FORMAT.toUpperCase(),
    async () => {
      const axiosErrorMock = jest.fn(async (url) => {
        if (url === EXPORT_SERVICE_PATH + '/exports') {
          return exampleGetResponse;
        }

        if (
          url ===
          EXPORT_SERVICE_PATH +
            '/exports/' +
            exampleGetResponse.data[0].id +
            '/status'
        ) {
          return {
            ...exampleGetResponse.data[0],
            status: 'failed',
          };
        }
      });
      useAxiosWithPlatformInterceptors.mockImplementation(() => ({
        post: axiosPostMock,
        get: axiosErrorMock,
      }));
      jest.useFakeTimers({ advanceTimers: true });

      const { result } = renderHook(() => useInventoryExport());

      result.current.onSelect(undefined, FORMAT);

      await waitFor(() => expect(axiosPostMock).toHaveBeenCalled());
      jest.clearAllMocks();
      jest.advanceTimersByTime(DOWNLOAD_CHECK_INTERVAL * 4);

      await waitFor(() =>
        expect(axiosErrorMock).toHaveBeenCalledWith(
          EXPORT_SERVICE_PATH +
            '/exports/' +
            exampleGetResponse.data[0].id +
            '/status',
        ),
      );

      expect(notificationMock).toHaveBeenCalledWith(ERROR_NOTIFICATION);
    },
  );

  it('should call onError if requesting export fails', async () => {
    const errorPostMock = jest.fn(async () => {
      throw new Error('Api Error');
    });
    useAxiosWithPlatformInterceptors.mockImplementation(() => ({
      post: errorPostMock,
    }));

    const { result } = renderHook(() => useInventoryExport());

    result.current.onSelect(undefined, FORMAT);

    await waitFor(() => expect(errorPostMock).toHaveBeenCalled());

    expect(notificationMock).toHaveBeenCalledWith(ERROR_NOTIFICATION);
  });

  it('should call onError if requesting export fails on download check', async () => {
    const axiosErrorMock = jest.fn(async () => {
      throw new Error('Api Error');
    });
    useAxiosWithPlatformInterceptors.mockImplementation(() => ({
      post: axiosPostMock,
      get: axiosErrorMock,
    }));

    const { result } = renderHook(() => useInventoryExport());

    result.current.onSelect(undefined, FORMAT);

    await waitFor(() => expect(axiosErrorMock).toHaveBeenCalled());

    expect(notificationMock).toHaveBeenCalledWith(ERROR_NOTIFICATION);
  });
});
