import { instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors/interceptors';
import axios from 'axios';
import { INVENTORY_API_BASE } from '../../../api';

//had to replace the instance.post with axios.post otherwise I had an error because chrome is missing
export const createGroup = (payload) => {
    return axios.post(`${INVENTORY_API_BASE}/groups`, {
        Name: payload.name,
        Type: 'static'
    });
};

export const addSystemsToGroup = (groupId, systems) => {
    return instance.post(`${INVENTORY_API_BASE}/groups/${groupId}`, {
        ID: groupId,
        Devices: systems
    });
};

export const validateGroupName = (name) => {
    return axios.get(`${INVENTORY_API_BASE}/groups/${name}`);
};
