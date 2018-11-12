import { INVENTORY_API_BASE } from './config';

/* eslint camelcase: off */
function buildMock (i) {
    return {
        id: `${i}`,
        canonical_facts: {
            machine_id: `${i}c1497de-0ec7-43bb-a8a6-35cabd59e0bf`
        },
        account: '000001',
        facts: [{
            facts: {
                hostname: `server0${i}.redhat.com`,
                release: 'Red Hat Enterprise Linux Server release 7.5 (Maipo)',
                rhel_version: '7.5',
                host_system_id: '6c1497de-0ec7-43bb-a8a6-35cabd59e0bf',
                bios_information: {
                    vendor: 'SeaBIOS',
                    version: '1.10.2-3.el7_4.1',
                    release_date: '04/01/2014',
                    bios_revision: '0.0'
                },
                system_information: {
                    family: 'Red Hat Enterprise Linux',
                    manufacturer: 'Red Hat',
                    product_name: 'RHEV Hypervisor',
                    virtual_machine: true
                },
                listening_processes: [],
                timezone_information: {
                    timezone: 'EDT',
                    utcoffset: '-0400'
                }
            },
            namespace: 'insights'
        }],
        health: {
            vulnerabilities: { title: 5, redirect: 'cost_management' },
            configuration: { title: 10, redirect: 'configuration_assessment' },
            compliance: { title: '74%', redirect: 'compliance' },
            cost: { title: '23K', redirect: 'cost_management' }
        },
        display_name: `Red Hat Enterprise Linux Server release 7.5 (Maipo)`
    };
}

const mockData = (id) => {
    const MOCKS = Array.from({ length: 5 }).map((v, i) => buildMock(i));
    return {
        results: id ? MOCKS.find(oneResult => id === oneResult.id) : MOCKS,
        isMocked: true
    };
};

let mockWarnCount = 0;

const addMockApp = (results) => results.map(row => ({
    id: row.id,
    health: {
        vulnerabilities: { title: 5, redirect: 'cost_management' },
        configuration: { title: 10, redirect: 'configuration_assessment' },
        compliance: { title: '74%', redirect: 'compliance' },
        cost: { title: '23K', redirect: 'cost_management' }
    }
}));

export function getEntities () {
    return fetch(INVENTORY_API_BASE).then(r => {
        if (r.ok) {
            return r.json().then(data => ({
                results: addMockApp(data.results)
            }));
        }

        if (r.status === 404) {
            if (!mockWarnCount) {
                mockWarnCount++;
                return new Promise((resolve) => resolve(mockData())).then(data => {
                    return ({
                        results: addMockApp(data.results)
                    });
                });
            }
        }

        throw new Error(`Unexpected response code ${r.status}`);
    });
}

export function getEntity (id) {
    return fetch(`${INVENTORY_API_BASE}/${id}`).then(r => {
        if (r.ok) {
            return r.json();
        }

        // TODO: remove me
        if (r.status === 404) {
            return mockData(id);
        }

        throw new Error(`Unexpected response code ${r.status}`);
    });
}
