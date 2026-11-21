import { getTagList } from '../../../api/hostInventoryApiTyped';
import { PER_PAGE_MAX } from '../../../constants';
import { fetchAccountTags } from './useAccountTagCatalog';

jest.mock('../../../api/hostInventoryApiTyped', () => ({
  getTagList: jest.fn(),
}));

const getTagListMock = jest.mocked(getTagList);

const page = (
  results: { namespace: string | null; key: string; value: string }[],
  total: number,
  pageNumber: number,
  perPage: number,
) => ({
  count: results.length,
  page: pageNumber,
  per_page: perPage,
  total,
  results: results.map((tag) => ({ tag, count: 1 })),
});

describe('fetchAccountTags', () => {
  beforeEach(() => {
    getTagListMock.mockReset();
  });

  it('requests every page before returning the catalog', async () => {
    getTagListMock
      .mockResolvedValueOnce(
        page(
          [{ namespace: 'insights-client', key: 'env', value: 'prod' }],
          2,
          1,
          1,
        ),
      )
      .mockResolvedValueOnce(
        page([{ namespace: null, key: 'owner', value: 'alice' }], 2, 2, 1),
      );

    await expect(fetchAccountTags()).resolves.toEqual([
      {
        tag: { namespace: 'insights-client', key: 'env', value: 'prod' },
        count: 1,
      },
      { tag: { namespace: null, key: 'owner', value: 'alice' }, count: 1 },
    ]);

    expect(getTagListMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ page: 1, perPage: PER_PAGE_MAX }),
    );
    expect(getTagListMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ page: 2, perPage: PER_PAGE_MAX }),
    );
  });

  it('stops after the page that covers the reported total', async () => {
    getTagListMock.mockResolvedValue(
      page(
        [{ namespace: 'insights-client', key: 'env', value: 'prod' }],
        1,
        1,
        PER_PAGE_MAX,
      ),
    );

    await fetchAccountTags();

    expect(getTagListMock).toHaveBeenCalledTimes(1);
  });
});
