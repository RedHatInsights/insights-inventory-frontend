/* eslint-disable camelcase */
import { filtersReducer, constructTags, mapData, getEntitySystemProfile, hosts } from './api';
import mockedData from '../__mocks__/mockedData.json';
import MockAdapter from 'axios-mock-adapter';

describe('system_profile', () => {
    const mockedHosts = new MockAdapter(hosts.axios);
    it('should send the data as JSON', async () => {
        mockedHosts.onGet('/api/inventory/v1/hosts/4/system_profile').reply(200, mockedData);
        const data = await getEntitySystemProfile('4');

        expect(mockedHosts.history.get.length).toBe(1);
        expect(data).toEqual(mockedData);
    });

    afterAll(() => {
        mockedHosts.reset();
    });
});

describe('filtersReducer', () => {
    it('should update original object', () => {
        expect(filtersReducer({ something: 'test' })).toMatchObject({ something: 'test' });
    });

    it('should generate hostnameOrId', () => {
        expect(filtersReducer({}, {
            value: 'hostname_or_id',
            filter: 'something'
        })).toMatchObject({ hostnameOrId: 'something' });
    });

    it('should generate tagFilters', () => {
        expect(filtersReducer({}, {
            tagFilters: 'something'
        })).toMatchObject({ tagFilters: 'something' });
    });

    it('should generate staleFilter', () => {
        expect(filtersReducer({}, {
            staleFilter: 'something'
        })).toMatchObject({ staleFilter: 'something' });
    });

    it('should generate registeredWithFilter', () => {
        expect(filtersReducer({}, {
            registeredWithFilter: 'something'
        })).toMatchObject({ registeredWithFilter: 'something' });
    });
});

describe('constructTags', () => {
    it('should map tags', () => {
        expect(constructTags([
            {
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
            }
        ])).toMatchObject(['namespace/some key=some value', 'some key']);
    });
});

describe('mapData', () => {
    it('should reduce facts', () => {
        expect(mapData({
            facts: [{
                namespace: 'something',
                facts: 'test'
            }]
        })).toMatchObject({
            facts: {
                something: 'test'
            }
        });
    });

    it('should flatten facts', () => {
        expect(mapData({
            facts: [{
                namespace: 'something',
                facts: {
                    another: 'test'
                }
            }]
        })).toMatchObject({
            facts: {
                another: 'test'
            }
        });
    });

    describe('os_release', () => {
        it('should use os_release', () => {
            expect(mapData({
                facts: [{
                    namespace: 'something',
                    facts: {
                        os_release: 'test'
                    }
                }]
            })).toMatchObject({
                facts: {
                    os_release: 'test'
                }
            });
        });

        it('should use release', () => {
            expect(mapData({
                facts: [{
                    namespace: 'something',
                    facts: {
                        release: 'test'
                    }
                }]
            })).toMatchObject({
                facts: {
                    os_release: 'test'
                }
            });
        });
    });

    describe('display_name', () => {
        it('should use display_name', () => {
            expect(mapData({
                facts: [{
                    namespace: 'something',
                    facts: {
                        display_name: 'test'
                    }
                }]
            })).toMatchObject({
                facts: {
                    display_name: 'test'
                }
            });
        });

        it('should use fqdn', () => {
            expect(mapData({
                facts: [{
                    namespace: 'something',
                    facts: {
                        fqdn: 'test'
                    }
                }]
            })).toMatchObject({
                facts: {
                    display_name: 'test'
                }
            });
        });

        it('should use id', () => {
            expect(mapData({
                facts: [{
                    namespace: 'something',
                    facts: {
                        id: 'test'
                    }
                }]
            })).toMatchObject({
                facts: {
                    display_name: 'test'
                }
            });
        });
    });
});
