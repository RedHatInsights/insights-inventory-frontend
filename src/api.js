import { INVENTORY_API_BASE } from './config';

export function getEntities () {
    return fetch(INVENTORY_API_BASE).then(r => r.json());
}
