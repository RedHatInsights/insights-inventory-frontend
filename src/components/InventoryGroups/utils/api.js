/* eslint-disable camelcase */
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  GROUPS_WILDCARD,
  INVENTORY_WILDCARD,
  INVENTORY_WRITE_WILDCARD,
  TABLE_DEFAULT_PAGINATION,
} from '../../../constants';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import {
  addHostListToGroup,
  deleteHostsFromGroup,
  getGroupList,
  getGroupsById,
  patchGroupById,
} from '../../../api/hostInventoryApi';

export const getGroups = (
  search = {},
  pagination = { page: 1, per_page: TABLE_DEFAULT_PAGINATION }
) => getGroupList({ ...search, ...pagination });

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

export const getGroupsByIds = (groupIds, search = {}) =>
  getGroupsById({ groupIdList: groupIds, ...search });

export const createGroup = (payload) => createGroup(payload);

// TODO: improve the function to check against all workspaces since now it checks only against first 50 workspaces
export const validateGroupName = (name) =>
  getGroupList().then((response) =>
    response?.results.some((group) => group.name === name)
  );

export const getGroupDetail = (groupId) =>
  getGroupsById({ groupIdList: [groupId] });

export const updateGroupById = (id, payload) =>
  patchGroupById({ groupId: id, groupIn: payload });

export const deleteGroupsById = (ids = []) => deleteGroupsById({ ids });

export const addHostsToGroupById = (id, hostIds) =>
  addHostListToGroup({ groupId: id, requestBody: hostIds });

export const removeHostsFromGroup = (groupId, hostIds) =>
  deleteHostsFromGroup({ groupId, hostIdList: hostIds });

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
