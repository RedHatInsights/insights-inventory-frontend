import { instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors/interceptors';
import { INVENTORY_API_BASE } from '../../../api';
import { TABLE_DEFAULT_PAGINATION } from '../../../constants';
import PropTypes from 'prop-types';

export const getGroups = (search = {}, pagination = { page: 1, perPage: TABLE_DEFAULT_PAGINATION }) => {
    const parameters = new URLSearchParams({
        ...search,
        ...pagination
    }).toString();

    return instance.get(`${INVENTORY_API_BASE}/groups?${parameters}` /* , { headers: { Prefer: 'code=404' } } */);
};

export const createGroup = (payload) => {
    return instance.post(`${INVENTORY_API_BASE}/groups`, {
        name: payload.name,
        // eslint-disable-next-line camelcase
        host_ids: []
    });
};

export const validateGroupName = (name) => {
    return instance.get(`${INVENTORY_API_BASE}/groups`)
    .then((resp) => resp?.results.some((group) => group.name === name));
};

export const updateGroupById = (id, payload) => {
    return instance.put(`${INVENTORY_API_BASE}/groups/${id}`, {
        name: payload.name
    });
};

getGroups.propTypes = {
    search: PropTypes.shape({
    // eslint-disable-next-line camelcase
        hostname_or_id: PropTypes.string
    }),
    pagination: PropTypes.shape({
        perPage: PropTypes.number,
        page: PropTypes.number
    })
};
