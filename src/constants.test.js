import { tagsMapper, onDeleteFilter, generateFilters, filterRows, prepareRows, isDate, ACTION_TYPES } from './constants';

describe('tagsMapper', () => {
    it('maps URL tags to object', () => {
        const result = [
            'system/owners=mary',
            'system/owners=jack',
            'system/yorkshire=jack',
            'different-thing/yorkshire=jack',
            'owners/josef',
            'justatag'
        ].reduce(tagsMapper, []);

        expect(result).toEqual(
            [
                {
                    category: 'system',
                    key: 'system',
                    type: 'tags',
                    values: [
                        {
                            group: {
                                label: 'system',
                                type: 'checkbox',
                                value: 'system'
                            },
                            key: 'owners=mary',
                            name: 'owners=mary',
                            tagKey: 'owners',
                            value: 'mary'
                        },
                        {
                            group: {
                                label: 'system',
                                type: 'checkbox',
                                value: 'system'
                            },
                            key: 'owners=jack',
                            name: 'owners=jack',
                            tagKey: 'owners',
                            value: 'jack'
                        },
                        {
                            group: {
                                label: 'system',
                                type: 'checkbox',
                                value: 'system'
                            },
                            key: 'yorkshire=jack',
                            name: 'yorkshire=jack',
                            tagKey: 'yorkshire',
                            value: 'jack'
                        }]
                },
                {
                    category: 'different-thing',
                    key: 'different-thing',
                    type: 'tags',
                    values: [
                        {
                            group: {
                                label: 'different-thing',
                                type: 'checkbox',
                                value: 'different-thing'
                            },
                            key: 'yorkshire=jack',
                            name: 'yorkshire=jack',
                            tagKey: 'yorkshire',
                            value: 'jack'
                        }]
                },
                {
                    category: 'owners',
                    key: 'owners',
                    type: 'tags',
                    values: [
                        {
                            group: {
                                label: 'owners',
                                type: 'checkbox',
                                value: 'owners'
                            },
                            key: 'josef',
                            tagKey: 'josef',
                            value: null,
                            name: 'josef'
                        }
                    ]
                },
                {
                    category: null,
                    key: null,
                    type: 'tags',
                    values: [
                        {
                            group: {
                                label: null,
                                type: 'checkbox',
                                value: null
                            },
                            key: 'justatag',
                            tagKey: 'justatag',
                            name: 'justatag',
                            value: null
                        }
                    ]
                }
            ]);
    });
});

describe('isDate', () => {
    it('should return true for number date', () => {
        expect(isDate(0)).toBe(true);
        expect(isDate('2019-08-13T13:28:13.431Z')).toBe(true);
    });

    it('should return true for string date', () => {
        expect(isDate('2019-08-13T13:28:13.431Z')).toBe(true);
    });

    it('should return false for incorrect dates', () => {
        expect(isDate('test')).toBe(false);
    });
});

describe('prepareRows', () => {
    it('should not fail', () => {
        expect(prepareRows()).toEqual([]);
    });

    it('should slice rows correctly', () => {
        const rows = prepareRows([...new Array(50)], { page: 1, perPage: 10 });
        expect(rows.length).toBe(10);
    });
});

describe('filterRows', () => {
    it('should not fail', () => {
        expect(filterRows()).toEqual([]);
    });

    it('should show all rows', () => {
        const rows = filterRows([...new Array(50)]);
        expect(rows.length).toBe(50);
    });

    it('should filter out all rows', () => {
        const rows = filterRows([...new Array(50)].map(() => ([...new Array(5)].map(() => 'value'))), {
            0: {
                key: 0,
                value: 'something'
            }
        });
        expect(rows.length).toBe(0);
    });

    it('should filter rows with value all rows', () => {
        const newRows = [...new Array(50)].map(() => ([...new Array(5)]));
        newRows[5][1] = 'something';
        newRows[6][1] = { sortValue: 'something' };
        const rows = filterRows(newRows, {
            0: {
                key: 1,
                value: 'something'
            }
        });
        expect(rows.length).toBe(2);
    });

    it('should filter rows with mutli value', () => {
        const newRows = [...new Array(50)].map(() => ([...new Array(5)]));
        newRows[5][1] = 'something';
        newRows[6][1] = { sortValue: 'something' };
        const rows = filterRows(newRows, {
            0: {
                key: 1,
                value: ['something']
            }
        });
        expect(rows.length).toBe(2);
    });
    it('should filter rows with mutli value and specific string', () => {
        const newRows = [...new Array(50)].map(() => ([...new Array(5)]));
        newRows[5][0] = 'something';
        newRows[5][1] = { sortValue: 'something' };
        const rows = filterRows(newRows, {
            0: {
                key: 0,
                value: ['something']
            },
            1: {
                key: 1,
                value: 'someth'
            }
        });
        expect(rows.length).toBe(1);
    });
});

describe('generateFilters', () => {
    it('should not fail', () => {
        expect(generateFilters()).toEqual([]);
    });

    it('should generate filters without keys', () => {
        const filters = generateFilters(
            ['Name', 'Surname', { title: 'Third' }],
            [
                { type: 'checkbox' },
                { type: 'something' },
                { type: 'another', options: [{ label: 'ff' }] },
                { index: 2 }
            ]);
        expect(filters[0]).toMatchObject({
            value: '0',
            label: 'Name'
        });
        expect(filters[1]).toMatchObject({
            value: '1',
            label: 'Surname'
        });
        expect(filters[2]).toMatchObject({
            value: '2',
            label: 'Third',
            filterValues: {
                items: [{ label: 'ff' }]
            }
        });
        expect(filters[3]).toMatchObject({
            value: '2',
            label: 'Third',
            type: 'text'
        });
        expect(filters.length).toBe(4);
    });

    it('should generate filter with value', () => {
        const filters = generateFilters(['Name', 'Surname'], [{ type: 'checkbox' }], { 0: { value: 'something' } });
        expect(filters[0].filterValues.value).toBe('something');
    });

    it('should call filter update', () => {
        const callback = jest.fn();
        const filters = generateFilters(['Name', 'Surname'], [{ type: 'checkbox' }], {}, callback);
        filters[0].filterValues.onChange({}, 'newValue');
        expect(callback).toHaveBeenCalled();
        expect(callback.mock.calls[0][0]).toBe(0);
        expect(callback.mock.calls[0][1]).toBe('newValue');
        expect(callback.mock.calls[0][2]).toBe('Name');
    });
});

describe('onDeleteFilter', () => {
    it('should not fail', () => {
        const newFilters = onDeleteFilter();
        expect(newFilters).toEqual({});
    });
    it('should remove all filters', () => {
        const newFilters = onDeleteFilter({}, true);
        expect(newFilters).toEqual({});
    });

    it('should remove active filter', () => {
        const newFilters = onDeleteFilter({ key: 'first' }, false, { first: {}, second: {} });
        expect(newFilters).toEqual({ second: {} });
    });

    it('should remove value from filter', () => {
        const newFilters = onDeleteFilter(
            {
                key: 'first',
                chips: [{ name: 'something' }]
            },
            false,
            { first: { value: ['something', 'second'] } }
        );
        expect(newFilters).toEqual({ first: {
            value: ['second']
        } });
    });
});

const asyncTypes = ['', '_PENDING', '_FULFILLED', '_REJECTED'];

asyncTypes.map((type) => {
    it(`LOAD_SYSTEM_PROFILE${type} should be defined`, () => {
        expect(ACTION_TYPES[`LOAD_SYSTEM_PROFILE${type}`]).toBeDefined();
    });
});
