import { INVENTORY_API_BASE } from './config';

export async function getAllEntities({ filters = [] }) {
    const config = {
        // eslint-disable-next-line camelcase
        per_page: 100,
        filters
    };
    const data = await getEntities({ page: 1, ...config });
    let numberOfpages = Math.ceil(Number(data.total) / 100);
    let results = data.results;
    if (numberOfpages > 1) {
        results = [
            ...results,
            ...await Promise.all([...Array(numberOfpages)].map((_item, key) => {
                if (key + 1 !== 1) {
                    return getEntities({ page: key + 1, ...config }).then(entities => entities.results);
                }
            }))
        ].filter(Boolean);
    }

    return results
    .flatMap(item => item)
    // eslint-disable-next-line no-unused-vars
    .flatMap(({ facts, ...item }) => item);
}

// eslint-disable-next-line camelcase
export function getEntities({ page, per_page, filters = [] }) {
    let query = '';
    const displayName = filters.find(item => item.value === 'display_name');
    // eslint-disable-next-line camelcase
    if (per_page || page || displayName) {
        // eslint-disable-next-line camelcase
        const params = { per_page, page, display_name: displayName && displayName.filter };
        query = '?' + Object.keys(params).reduce(
            (acc, curr) => [...acc, `${curr}=${params[curr]}`], []
        ).filter(item => item.indexOf('undefined') === -1).join('&');
    }

    return fetch(`${INVENTORY_API_BASE}${query}`).then(r => {
        if (r.ok) {
            return r.json();
        }

        throw new Error(`Unexpected response code ${r.status}`);
    });
}

export function getEntity () {
    return insights.chrome.auth.getUser();
}
