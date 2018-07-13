import { INVENTORY_API_BASE } from './config';
import find from 'lodash/find';

export function getEntities () {
    return fetch(INVENTORY_API_BASE).then(r => r.json());
}

export function getEntity (id) {
    return getEntities().then(entities => {
        return find(entities, e => e.id === parseInt(id));
    });
}
