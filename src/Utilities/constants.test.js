import { generateFilter, isEmpty } from './constants';
import { reloadWrapper, reduceFilters } from './constants';

describe('reloadWrapper', () => {
    it('should call callback once promise is done', async () => {
        const callback = jest.fn();
        const promise = Promise.resolve('something');
        const data = await reloadWrapper({
            payload: promise
        }, callback);
        expect(callback).toHaveBeenCalled();
        expect(data).toBeDefined();
        await promise;
        expect(callback).toHaveBeenCalled();
    });
});

describe('reduceFilters', () => {
    it('should calculate TEXT_FILTER', () => {
        const data = reduceFilters([{
            value: 'hostname_or_id',
            filter: 'something'
        }]);
        expect(data.textFilter).toBe('something');
    });

    it('should calculate tagFilters', () => {
        const data = reduceFilters([{
            tagFilters: [{
                key: 'something',
                values: [{ key: 'test', tagKey: 'test', value: 'some', group: 'another' }]
            }]
        }]);
        expect(data.tagFilters).toMatchObject({
            something: {
                test: {
                    group: 'another',
                    isSelected: true,
                    item: {
                        meta: {
                            tag: { key: 'test', value: 'some' }
                        }
                    }
                }
            }
        });
    });

    it('should calculate staleFilter', () => {
        const data = reduceFilters([{
            staleFilter: 'something'
        }]);
        expect(data.staleFilter).toBe('something');
    });

    it('should calculate registeredWithFilter', () => {
        const data = reduceFilters([{
            registeredWithFilter: 'something'
        }]);
        expect(data.registeredWithFilter).toBe('something');
    });
});

describe('generateFilter', () => {
    it('should generate empty array', () => {
        const result = generateFilter();
        expect(result.length).toBe(0);
    });

    describe('status filter', () => {
        it('should generate filter with empty source - string', () => {
            const result = generateFilter('something');
            expect(result.length).toBe(2);
            expect(result).toMatchObject([
                { staleFilter: ['something'] },
                { registeredWithFilter: [] }
            ]);
        });

        it('should generate filter with empty source - array', () => {
            const result = generateFilter(['something']);
            expect(result.length).toBe(2);
            expect(result).toMatchObject([
                { staleFilter: ['something'] },
                { registeredWithFilter: [] }
            ]);
        });
    });

    describe('source filter', () => {
        it('should generate filter with empty status - string', () => {
            const result = generateFilter(undefined, 'something');
            expect(result.length).toBe(2);
            expect(result).toMatchObject([
                { registeredWithFilter: ['something'] },
                { staleFilter: [] }
            ]);
        });

        it('should generate filter with empty status - array', () => {
            const result = generateFilter(undefined, ['something']);
            expect(result.length).toBe(2);
            expect(result).toMatchObject([
                { registeredWithFilter: ['something'] },
                { staleFilter: [] }
            ]);
        });
    });

    describe('tags filter', () => {
        it('should generate filter and rest empty - string', () => {
            const result = generateFilter(undefined, undefined, 'something');
            expect(result.length).toBe(3);
            expect(result).toMatchObject([
                { tagFilters: ['something'] },
                { registeredWithFilter: [] },
                { staleFilter: [] }
            ]);
        });

        it('should generate filter and rest empty - array', () => {
            const result = generateFilter(undefined, undefined, ['something']);
            expect(result.length).toBe(3);
            expect(result).toMatchObject([
                { tagFilters: ['something'] },
                { registeredWithFilter: [] },
                { staleFilter: [] }
            ]);
        });
    });

    describe('filter by name or id', () => {
        it('should generate filter and rest empty - string', () => {
            const result = generateFilter(undefined, undefined, undefined, 'something');
            expect(result.length).toBe(3);
            expect(result).toMatchObject([
                {
                    value: 'hostname_or_id',
                    filter: 'something'
                },
                { registeredWithFilter: [] },
                { staleFilter: [] }
            ]);
        });

        it('should generate filter and rest empty - array', () => {
            const result = generateFilter(undefined, undefined, undefined, ['something']);
            expect(result.length).toBe(3);
            expect(result).toMatchObject([
                {
                    value: 'hostname_or_id',
                    filter: 'something'
                },
                { registeredWithFilter: [] },
                { staleFilter: [] }
            ]);
        });
    });

    it('should generate stale and source filter', () => {
        const result = generateFilter('test', 'something');
        expect(result.length).toBe(2);
        expect(result).toMatchObject([
            { staleFilter: ['test'] },
            { registeredWithFilter: ['something'] }
        ]);
    });

    it('should generate full filter', () => {
        const result = generateFilter('one', 'two', 'three', 'four');
        expect(result).toMatchObject([
            { staleFilter: ['one'] },
            { tagFilters: ['three'] },
            { registeredWithFilter: ['two'] },
            {
                value: 'hostname_or_id',
                filter: 'four'
            }
        ]);
    });
});

describe('isEmpty', () => {
    it('should return true', () => {
        expect(isEmpty()).toBe(true);
        expect(isEmpty([])).toBe(true);
    });

    it('should return false', () => {
        expect(isEmpty(['test'])).toBe(false);
    });
});
