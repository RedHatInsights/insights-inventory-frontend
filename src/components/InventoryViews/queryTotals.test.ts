import type { ApiHostGetHostListParams } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import type { ApiHostViewsGetHostViewsParams } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import {
  getHostList,
  getHostTags,
  getHostViews,
} from '../../api/hostInventoryApiTyped';
import type { SystemsViewFetchParams } from '../SystemsView/types';
import { isPaginatedRequestNotFound } from '../SystemsView/utils/paginatedRequestError';
import { fetchHosts } from './hostsQueryOptions';
import { fetchInventoryViews } from './inventoryViewsQueryOptions';

jest.mock('../../api/hostInventoryApiTyped', () => ({
  getHostList: jest.fn(),
  getHostTags: jest.fn(),
  getHostViews: jest.fn(),
}));

const hostListParams: SystemsViewFetchParams<ApiHostGetHostListParams> = {
  page: 3,
  perPage: 50,
  sortBy: undefined,
  direction: undefined,
  filterParams: {},
};

const hostViewsParams: SystemsViewFetchParams<ApiHostViewsGetHostViewsParams> =
  {
    ...hostListParams,
    filterParams: {},
  };

describe('inventory query totals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('preserves an unknown total from the host list API', async () => {
    jest.mocked(getHostList).mockResolvedValue({
      results: [{ id: 'host-1' }],
      total: undefined,
    } as never);
    jest.mocked(getHostTags).mockResolvedValue({ results: {} } as never);

    await expect(fetchHosts(hostListParams)).resolves.toEqual({
      results: [{ id: 'host-1' }],
      total: undefined,
    });
  });

  it('preserves an unknown total from the inventory views API', async () => {
    jest.mocked(getHostViews).mockResolvedValue({
      results: [{ id: 'host-1' }],
      total: undefined,
      denied_services: [],
    } as never);
    jest.mocked(getHostTags).mockResolvedValue({ results: {} } as never);

    await expect(fetchInventoryViews(hostViewsParams)).resolves.toEqual({
      results: [{ id: 'host-1' }],
      total: undefined,
      deniedServices: [],
    });
  });

  it('returns an empty host page without requesting tags when total is nonzero', async () => {
    jest.mocked(getHostList).mockResolvedValue({
      results: [],
      total: 101,
    } as never);

    await expect(fetchHosts(hostListParams)).resolves.toEqual({
      results: [],
      total: 101,
    });
    expect(getHostTags).not.toHaveBeenCalled();
  });

  it('returns an empty inventory-view page without requesting tags when total is nonzero', async () => {
    jest.mocked(getHostViews).mockResolvedValue({
      results: [],
      total: 101,
      denied_services: [],
    } as never);

    await expect(fetchInventoryViews(hostViewsParams)).resolves.toEqual({
      results: [],
      total: 101,
      deniedServices: [],
    });
    expect(getHostTags).not.toHaveBeenCalled();
  });

  it('marks a host list 404 for SystemsView pagination recovery', async () => {
    jest.mocked(getHostList).mockRejectedValue(
      Object.assign(new Error('Page not found'), {
        response: { status: 404 },
      }) as never,
    );

    await expect(fetchHosts(hostListParams)).rejects.toMatchObject({
      isPaginatedRequestNotFound: true,
    });
  });

  it('marks an inventory views list 404 for SystemsView pagination recovery', async () => {
    jest.mocked(getHostViews).mockRejectedValue(
      Object.assign(new Error('Page not found'), {
        response: { status: 404 },
      }) as never,
    );

    await expect(fetchInventoryViews(hostViewsParams)).rejects.toMatchObject({
      isPaginatedRequestNotFound: true,
    });
  });

  it('does not mark a host tags 404 as a pagination error', async () => {
    const tagsError = Object.assign(new Error('Tags not found'), {
      response: { status: 404 },
    });
    jest.mocked(getHostList).mockResolvedValue({
      results: [{ id: 'host-1' }],
      total: 1,
    } as never);
    jest.mocked(getHostTags).mockRejectedValue(tagsError as never);

    let caughtError: unknown;
    try {
      await fetchHosts(hostListParams);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBe(tagsError);
    expect(isPaginatedRequestNotFound(caughtError)).toBe(false);
  });
});
