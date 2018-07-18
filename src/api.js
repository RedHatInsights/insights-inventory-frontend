import { INVENTORY_API_BASE } from './config';

export function getEntities () {
    return fetch(INVENTORY_API_BASE).then(r => {
        if (r.ok) {
            return r.json();
        }

        throw new Error(`Unexpected response code ${r.status}`);
    });
}

export function getEntity (id) {
    return getEntities().then(entities => {
        return entities.find(e => e.id === id);
    });
}
