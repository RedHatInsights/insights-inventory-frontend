import { getAllTags, tags } from './api';
import MockAdapter from 'axios-mock-adapter';

describe('getAllTags', () => {
    const mockedTags = new MockAdapter(tags.axios, { onNoMatch: 'throwException' });
    it('should generate get all tags call', async () => {
        const params = '?order_by=tag&order_how=ASC&per_page=10&page=1&staleness=fresh&staleness=stale';
        mockedTags.onGet(
            `/api/inventory/v1/tags${params}`
        ).replyOnce(200, { test: 'test' });
        const data = await getAllTags();
        expect(data).toMatchObject({ test: 'test' });
    });

    it('should generate get all tags call with search', async () => {
        // eslint-disable-next-line max-len
        const params = '?order_by=tag&order_how=ASC&per_page=10&page=1&staleness=fresh&staleness=stale&search=something';
        mockedTags.onGet(`/api/inventory/v1/tags${params}`).replyOnce(200, { test: 'test' });
        const data = await getAllTags('something');
        expect(data).toMatchObject({ test: 'test' });
    });

    describe('tagFilters', () => {
        it('should generate get all tags call with tagFilters', async () => {
            // eslint-disable-next-line max-len
            const params = '?tags=namespace%2Fsome%20key%3Dsome%20value&tags=some%20key&order_by=tag&order_how=ASC&per_page=10&page=1&staleness=fresh&staleness=stale';
            mockedTags.onGet(`/api/inventory/v1/tags${params}`).replyOnce(200, { test: 'test' });
            const data = await getAllTags(undefined, {
                filters: [{
                    tagFilters: [{
                        values: [{
                            value: 'some value',
                            tagKey: 'some key'
                        }],
                        category: 'namespace'
                    },
                    {
                        values: [{
                            value: '',
                            tagKey: 'some key'
                        }],
                        category: ''
                    }]
                }]
            });
            expect(data).toMatchObject({ test: 'test' });
        });

        it('should generate get all tags call with staleFilter', async () => {
            const params = '?order_by=tag&order_how=ASC&per_page=10&page=1&staleness=something';
            mockedTags.onGet(`/api/inventory/v1/tags${params}`).replyOnce(200, { test: 'test' });
            const data = await getAllTags(undefined, {
                filters: [{
                    staleFilter: ['something']
                }]
            });
            expect(data).toMatchObject({ test: 'test' });
        });

        it('should generate get all tags call with osFilter', async () => {
            mockedTags.resetHistory();
            // eslint-disable-next-line max-len
            const params = '?order_by=tag&order_how=ASC&per_page=10&page=1&staleness=fresh&staleness=stale&filter%5Bsystem_profile%5D%5Boperating_system%5D%5BRHEL%5D%5Bversion%5D%5Beq%5D%5B%5D=8.1';
            mockedTags.onGet(`/api/inventory/v1/tags${params}`).replyOnce(200, { test: 'test' });
            const data = await getAllTags(undefined, {
                filters: [{
                    osFilter: {
                        '8.0': {
                            8.1: true
                        }
                    }
                }]
            });
            expect(data).toMatchObject({ test: 'test' });
        });

        it('should generate get all tags call with registeredWithFilter', async () => {
            // eslint-disable-next-line max-len
            const params = '?order_by=tag&order_how=ASC&per_page=10&page=1&staleness=fresh&staleness=stale&registered_with=something';
            mockedTags.onGet(`/api/inventory/v1/tags${params}`).replyOnce(200, { test: 'test' });
            const data = await getAllTags(undefined, {
                filters: [{
                    registeredWithFilter: ['something']
                }]
            });
            expect(data).toMatchObject({ test: 'test' });
        });
    });

    describe('pagination', () => {
        it('should generate get all tags call with perPage', async () => {
            // eslint-disable-next-line max-len
            const params = '?order_by=tag&order_how=ASC&per_page=50&page=1&staleness=fresh&staleness=stale';
            mockedTags.onGet(`/api/inventory/v1/tags${params}`).replyOnce(200, { test: 'test' });
            const data = await getAllTags(undefined, {
                pagination: {
                    perPage: 50
                }
            });
            expect(data).toMatchObject({ test: 'test' });
        });

        it('should generate get all tags call with page', async () => {
            // eslint-disable-next-line max-len
            const params = '?order_by=tag&order_how=ASC&per_page=10&page=20&staleness=fresh&staleness=stale';
            mockedTags.onGet(`/api/inventory/v1/tags${params}`).replyOnce(200, { test: 'test' });
            const data = await getAllTags(undefined, {
                pagination: {
                    page: 20
                }
            });
            expect(data).toMatchObject({ test: 'test' });
        });
    });

    afterAll(() => {
        mockedTags.reset();
    });
});
