import type { ApiHostGetHostListParams } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import type { ApiHostViewsGetHostViewsParams } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import {
  getHostList,
  getHostTags,
  getHostViews,
} from '../../api/hostInventoryApiTyped';
import type { SystemsViewFetchParams } from '../SystemsView/types';
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
});
