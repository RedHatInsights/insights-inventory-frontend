import { INVENTORY_API_BASE } from './config';

const addMockApp = (results) => results.map(row => ({
    id: row.id,
    health: {
        vulnerabilities: { title: 5, redirect: 'cost_management' },
        configuration: { title: 10, redirect: 'configuration_assessment' },
        compliance: { title: '74%', redirect: 'compliance' },
        cost: { title: '23K', redirect: 'cost_management' }
    }
}));

// eslint-disable-next-line camelcase
export function getEntities({ page, per_page }) {
    let query = '';
    // eslint-disable-next-line camelcase
    if (per_page || page) {
        // eslint-disable-next-line camelcase
        const params = { per_page, page };
        query = '?' + Object.keys(params).reduce(
            (acc, curr) => [...acc, `${curr}=${params[curr]}`], []
        ).join('&');
    }

    return fetch(`${INVENTORY_API_BASE}${query}`).then(r => {
        if (r.ok) {
            return r.json().then(data => ({
                results: addMockApp(data.results)
            }));
        }

        throw new Error(`Unexpected response code ${r.status}`);
    });
}

export function getEntity (id) {
    return fetch(`${INVENTORY_API_BASE}/${id}`).then(r => {
        if (r.ok) {
            return r.json();
        }

        throw new Error(`Unexpected response code ${r.status}`);
    });
}
