import { instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors/interceptors';

//replace with the real api endpoint address
const mockApiAddress = '/api/inventory/v1/groups';
export const createGroup = (payload) => {
    return instance.post(`${mockApiAddress}/groups`, {
        Name: payload.name,
        Type: 'static'
    });
};

export const addSystemsToGroup = (groupId, systems) => {
    return instance.post(`${mockApiAddress}/groups/${groupId}`, {
        ID: groupId,
        Devices: systems
    });
};
