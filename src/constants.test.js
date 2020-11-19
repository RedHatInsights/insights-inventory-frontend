import { tagsMapper } from './constants';

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
