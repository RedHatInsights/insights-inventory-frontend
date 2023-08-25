/* eslint-disable camelcase */
import { instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors/interceptors';
import { INVENTORY_API_BASE } from '../../../api';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  GROUPS_WILDCARD,
  INVENTORY_WILDCARD,
  INVENTORY_WRITE_WILDCARD,
  TABLE_DEFAULT_PAGINATION,
} from '../../../constants';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

export const getGroups = (
  search = {},
  pagination = { page: 1, per_page: TABLE_DEFAULT_PAGINATION }
) => {
  const parameters = new URLSearchParams({
    ...search,
    ...pagination,
  }).toString();
  const path = `${INVENTORY_API_BASE}/groups${
    parameters.length > 0 ? '?' + parameters : ''
  }`;

  return instance.get(path);
};

export const getWritableGroups = async (
  groupName,
  pagination = {},
  getUserPermissions
) => {
  let groupsWritePermissions = [];

  try {
    const permissions = await getUserPermissions();
    // according to chrome interface, permission is an object with "permission" and "resourceDefinitions" keys
    groupsWritePermissions = permissions.filter(({ permission }) =>
      [
        GENERAL_GROUPS_WRITE_PERMISSION,
        GROUPS_WILDCARD,
        INVENTORY_WILDCARD,
        INVENTORY_WRITE_WILDCARD,
      ].includes(permission)
    );
  } catch (error) {
    console.error('Could not fetch groups permissions.', error);
  }

  if (
    !isEmpty(
      groupsWritePermissions.filter(({ resourceDefinitions }) =>
        isEmpty(resourceDefinitions)
      )
    ) // has general groups write permission; can fetch all groups
  ) {
    const groups = await getGroups(
      groupName ? { name: groupName } : {},
      pagination
    );

    return groups.results;
  } else {
    // has limited groups write permissions; can fetch only permitted groups
    if (isEmpty(groupsWritePermissions)) {
      return [];
    }

    let groups = [];

    try {
      groups = await getGroupsByIds(
        groupsWritePermissions
          .reduce(
            (prev, cur) => [
              ...prev,
              cur.resourceDefinitions.map(({ attributeFilter }) =>
                attributeFilter.operation === 'in'
                  ? attributeFilter.value
                  : [attributeFilter.value]
              ),
            ],
            []
          )
          .flat()
      );
    } catch (error) {
      console.error('Could not fetch writable groups.', error);
    }

    return groups.results.filter(({ name }) =>
      name.toLowerCase().includes(groupName ? groupName.toLowerCase() : '')
    );
  }
};

export const getGroupsByIds = (groupIds, search = {}) => {
  const parameters = new URLSearchParams(search).toString();
  const path = `${INVENTORY_API_BASE}/groups/${groupIds.join(',')}${
    parameters.length > 0 ? '?' + parameters : ''
  }`;

  return instance.get(path);
};

export const createGroup = (payload) => {
  return instance.post(`${INVENTORY_API_BASE}/groups`, {
    name: payload.name,
  });
};

export const validateGroupName = (name) => {
  return instance
    .get(`${INVENTORY_API_BASE}/groups`)
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
  return instance.delete(
    `${INVENTORY_API_BASE}/groups/${groupId}/hosts/${hostIds.join(',')}`
  );
};

getGroups.propTypes = {
  search: PropTypes.shape({
    name: PropTypes.string,
  }),
  pagination: PropTypes.shape({
    per_page: PropTypes.number,
    page: PropTypes.number,
  }),
};

getGroupDetail.propTypes = {
  groupId: PropTypes.string.isRequired,
};
