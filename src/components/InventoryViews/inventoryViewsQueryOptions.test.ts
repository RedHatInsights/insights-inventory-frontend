import { getHostTags, getHostViews } from '../../api/hostInventoryApiTyped';
import { fetchInventoryViews } from './inventoryViewsQueryOptions';

jest.mock('../../api/hostInventoryApiTyped', () => ({
  getHostViews: jest.fn(),
  getHostTags: jest.fn(),
}));

const getHostViewsMock = jest.mocked(getHostViews);
const getHostTagsMock = jest.mocked(getHostTags);

const fetchParams = {
  page: 1,
  perPage: 50,
  sortBy: undefined,
  direction: 'desc' as const,
  filterParams: {},
};

describe('fetchInventoryViews tags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses tags on the hosts-view row and does not call getHostTags', async () => {
    getHostViewsMock.mockResolvedValue({
      total: 1,
      count: 1,
      page: 1,
      per_page: 50,
      results: [
        {
          id: 'host-1',
          tags: [
            { namespace: 'insights-client', key: 'env', value: 'prod' },
            { namespace: 'insights-client', key: 'env', value: 'stage' },
            { namespace: null, key: 'owner', value: null },
          ],
        },
      ],
    } as unknown as Awaited<ReturnType<typeof getHostViews>>);

    const { results } = await fetchInventoryViews(fetchParams);

    expect(getHostTagsMock).not.toHaveBeenCalled();
    expect(results[0].tags).toEqual([
      { namespace: 'insights-client', key: 'env', value: 'prod' },
      { namespace: 'insights-client', key: 'env', value: 'stage' },
      { namespace: null, key: 'owner', value: null },
    ]);
    expect(results[0].tagsByKey).toEqual({
      'insights-client/env': ['prod', 'stage'],
      owner: [],
    });
  });

  it('keeps an empty tags array and does not call getHostTags', async () => {
    getHostViewsMock.mockResolvedValue({
      total: 1,
      count: 1,
      page: 1,
      per_page: 50,
      results: [{ id: 'host-1', tags: [] }],
    } as unknown as Awaited<ReturnType<typeof getHostViews>>);

    const { results } = await fetchInventoryViews(fetchParams);

    expect(getHostTagsMock).not.toHaveBeenCalled();
    expect(results[0].tags).toEqual([]);
    expect(results[0].tagsByKey).toEqual({});
  });

  it('falls back to getHostTags when tags is absent', async () => {
    getHostViewsMock.mockResolvedValue({
      total: 1,
      count: 1,
      page: 1,
      per_page: 50,
      results: [{ id: 'host-1' }],
    } as unknown as Awaited<ReturnType<typeof getHostViews>>);
    getHostTagsMock.mockResolvedValue({
      total: 1,
      count: 1,
      page: 1,
      per_page: 50,
      results: {
        'host-1': [{ namespace: 'satellite', key: 'env', value: 'stage' }],
      },
    });

    const { results } = await fetchInventoryViews(fetchParams);

    expect(getHostTagsMock).toHaveBeenCalledWith({ hostIdList: ['host-1'] });
    expect(results[0].tags).toEqual([
      { namespace: 'satellite', key: 'env', value: 'stage' },
    ]);
    expect(results[0].tagsByKey).toEqual({ 'satellite/env': ['stage'] });
  });
});
