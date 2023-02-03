import { instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors/interceptors';

//replace with the real api endpoint address
const mockApiAddress = 'http://127.0.0.1:4010';
export const createGroup = (payload) => {
    return instance.post(`${mockApiAddress}/groups/`, {
        Name: payload.name,
        Type: 'static'
    });
};
