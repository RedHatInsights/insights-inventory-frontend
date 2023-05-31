/* eslint-disable camelcase */
import { instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors/interceptors';
import { INVENTORY_API_BASE } from '../../../api';
import { TABLE_DEFAULT_PAGINATION } from '../../../constants';
import PropTypes from 'prop-types';

export const getGroups = (search = {}, pagination = { page: 1, per_page: TABLE_DEFAULT_PAGINATION }) => {
    const parameters = new URLSearchParams({
        ...search,
        ...pagination
    }).toString();

    return instance.get(`${INVENTORY_API_BASE}/groups?${parameters}` /* , { headers: { Prefer: 'code=404' } } */);
};

export const createGroup = (payload) => {
    return instance.post(`${INVENTORY_API_BASE}/groups`, {
        name: payload.name
    });
};

export const validateGroupName = (name) => {
    return instance.get(`${INVENTORY_API_BASE}/groups`)
    .then((resp) => resp?.results.some((group) => group.name === name));
};

export const getGroupDetail = (groupId) => {
    return instance.get(`${INVENTORY_API_BASE}/groups/${groupId}`);
};

export const updateGroupById = (id, payload) => {
    return instance.patch(`${INVENTORY_API_BASE}/groups/${id}`, payload);
};

export const deleteGroupsById = (ids = []) => {
    return instance.delete(`${INVENTORY_API_BASE}/groups/${ids.join(',')}`);
};

export const addHostsToGroupById = (id, hostIds) => {
    return instance.post(`${INVENTORY_API_BASE}/groups/${id}/hosts`, hostIds);
};

export const removeHostsFromGroup = (groupId, hostIds) => {
    return instance.delete(`${INVENTORY_API_BASE}/groups/${groupId}/hosts/${hostIds.join(',')}`);
};

getGroups.propTypes = {
    search: PropTypes.shape({
        name: PropTypes.string
    }),
    pagination: PropTypes.shape({
        per_page: PropTypes.number,
        page: PropTypes.number
    })
};

getGroupDetail.propTypes = {
    groupId: PropTypes.string.isRequired
};
