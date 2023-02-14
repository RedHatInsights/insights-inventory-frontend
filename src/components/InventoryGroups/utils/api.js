import { instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors/interceptors';
import { INVENTORY_API_BASE } from '../../../api';

export const getGroups = () => {
    // TODO: support parameters
    return instance.get(`${INVENTORY_API_BASE}/groups`);
};
