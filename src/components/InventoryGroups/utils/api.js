/* eslint-disable camelcase */
import { instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors/interceptors';
import { INVENTORY_API_BASE } from '../../../api';
import { TABLE_DEFAULT_PAGINATION } from '../../../constants';
import PropTypes from 'prop-types';
import union from 'lodash/union';
import fixtureGroups from '../../../../cypress/fixtures/groups.json';
import fixtureGroupsDetails from '../../../../cypress/fixtures/groups/Ba8B79ab5adC8E41e255D5f8aDb8f1F3.json';

// eslint-disable-next-line camelcase
export const getGroups = (search = {}, pagination = { page: 1, per_page: TABLE_DEFAULT_PAGINATION }) => {
    if (window.Cypress) {
        const parameters = new URLSearchParams({
            ...search,
            ...pagination
        }).toString();

        return instance.get(`${INVENTORY_API_BASE}/groups?${parameters}`);
    }

    // FIXME: remove mock data when API is implemented
    return Promise.resolve(fixtureGroups);
};

export const createGroup = (payload) => {
    return instance.post(`${INVENTORY_API_BASE}/groups`, {
        name: payload.name,
        // eslint-disable-next-line camelcase
        host_ids: []
    });
};

export const validateGroupName = (name) => {
    if (window.Cypress) {
        return instance.get(`${INVENTORY_API_BASE}/groups`)
        .then((resp) => resp?.results.some((group) => group.name === name));
    }

    // FIXME: remove mock data when API is implemented
    return Promise.resolve(fixtureGroups).then((resp) => resp?.results.some((group) => group.name === name));
};

export const getGroupDetail = (groupId) => {
    if (window.Cypress) {
        return instance.get(`${INVENTORY_API_BASE}/groups/${groupId}`);
    }

    // FIXME: remove mock data when API is implemented
    return Promise.resolve(fixtureGroupsDetails);
};

export const updateGroupById = (id, payload) => {
    return instance.patch(`${INVENTORY_API_BASE}/groups/${id}`, payload);
};

export const deleteGroupsById = (ids = []) => {
    return instance.delete(`${INVENTORY_API_BASE}/groups/${ids.join(',')}`);
};

export const addHostsToGroupById = (id, hostIds) => {
    // the current hosts must be fetched before merging with the new ones
    return getGroupDetail(id).then((response) =>
        updateGroupById(id, {
            // eslint-disable-next-line camelcase
            host_ids: union(response.results[0].host_ids, hostIds)
        })
    );
};

export const addHostToGroup = (groupId, newHostId) => {
    return instance.post(`${INVENTORY_API_BASE}/groups/${groupId}/hosts/${newHostId}`, {
        host_ids: newHostId
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

getGroupDetail.propTypes = {
    groupId: PropTypes.string.isRequired
};
