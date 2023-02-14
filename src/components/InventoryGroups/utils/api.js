import { instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors/interceptors';
import { INVENTORY_API_BASE } from '../../../api';

export const createGroup = (payload) => {
    return instance.post(`${INVENTORY_API_BASE}/groups`, {
        name: payload.name,
        // eslint-disable-next-line camelcase
        host_ids: []
    });
};

export const validateGroupName = (name) => {
    return instance.get(`${INVENTORY_API_BASE}/groups`)
    .then((resp) => resp[0]?.results.some((group) => group.name === name));
};
