import { getAllTags } from './api';
import MockAdapter from 'axios-mock-adapter';
import { hostInventoryApi } from './hostInventoryApi';

describe('getAllTags', () => {
  const mockedTags = new MockAdapter(hostInventoryApi.axios, {
    onNoMatch: 'throwException',
  });
  it('should generate get all tags call', async () => {
    const params =
      '?order_by=tag&order_how=ASC&per_page=10&page=1&staleness=fresh&staleness=stale&staleness=stale_warning';
    mockedTags
      .onGet(`/api/inventory/v1/tags${params}`)
      .replyOnce(200, { test: 'test' });
    const data = await getAllTags();
    expect(data).toMatchObject({ test: 'test' });
  });

  it('should generate get all tags call with search', async () => {
    const params =
      '?order_by=tag&order_how=ASC&per_page=10&page=1&staleness=fresh&staleness=stale&staleness=stale_warning&search=something';
    mockedTags
      .onGet(`/api/inventory/v1/tags${params}`)
      .replyOnce(200, { test: 'test' });
    const data = await getAllTags('something');
    expect(data).toMatchObject({ test: 'test' });
  });

  describe('pagination', () => {
    it('should generate get all tags call with perPage', async () => {
      const params =
        '?order_by=tag&order_how=ASC&per_page=50&page=1&staleness=fresh&staleness=stale&staleness=stale_warning';
      mockedTags
        .onGet(`/api/inventory/v1/tags${params}`)
        .replyOnce(200, { test: 'test' });
      const data = await getAllTags(undefined, {
        perPage: 50,
      });
      expect(data).toMatchObject({ test: 'test' });
    });

    it('should generate get all tags call with page', async () => {
      const params =
        '?order_by=tag&order_how=ASC&per_page=10&page=20&staleness=fresh&staleness=stale&staleness=stale_warning';
      mockedTags
        .onGet(`/api/inventory/v1/tags${params}`)
        .replyOnce(200, { test: 'test' });
      const data = await getAllTags(undefined, {
        page: 20,
      });
      expect(data).toMatchObject({ test: 'test' });
    });
  });

  afterAll(() => {
    mockedTags.reset();
  });
});
