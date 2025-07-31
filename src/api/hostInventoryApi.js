import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared';
import axiosInstance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import * as endpoints from '@redhat-cloud-services/host-inventory-client';

export const INVENTORY_API_BASE = '/api/inventory/v1';

const hostInventoryApi = (axios = axiosInstance) =>
  APIFactory(INVENTORY_API_BASE, endpoints, {
    axios,
  });

const getHostSystemProfileById = async ({
  hostIdList,
  perPage,
  page,
  orderBy,
  orderHow,
  branchId,
  fields,
  options: { axios, ...options } = {},
}) =>
  await hostInventoryApi(axios).apiHostGetHostSystemProfileById(
    hostIdList,
    perPage,
    page,
    orderBy,
    orderHow,
    branchId,
    fields,
    options,
  );

const getHostTags = async ({
  hostIdList,
  perPage,
  page,
  orderBy,
  orderHow,
  search,
  options: { axios, ...options } = {},
}) =>
  await hostInventoryApi(axios).apiHostGetHostTags(
    hostIdList,
    perPage,
    page,
    orderBy,
    orderHow,
    search,
    options,
  );

const getHostById = async ({
  hostIdList,
  branchId,
  perPage,
  page,
  orderBy,
  orderHow,
  fields,
  options: { axios, ...options } = {},
}) =>
  await hostInventoryApi(axios).apiHostGetHostById(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
    hostIdList,
    branchId,
    perPage,
    page,
    orderBy,
    orderHow,
    fields,
    options,
  );

const getHostList = async ({
  displayName,
  fqdn,
  hostnameOrId,
  insightsId,
  subscriptionManagerId,
  providerId,
  providerType,
  updatedStart,
  updatedEnd,
  groupName,
  branchId,
  perPage,
  page,
  orderBy,
  orderHow,
  staleness,
  tags,
  registeredWith,
  filter,
  fields,
  options: { axios, ...options } = {},
} = {}) =>
  await hostInventoryApi(axios).apiHostGetHostList(
    displayName,
    fqdn,
    hostnameOrId,
    insightsId,
    subscriptionManagerId,
    providerId,
    providerType,
    updatedStart,
    updatedEnd,
    groupName,
    branchId,
    perPage,
    page,
    orderBy,
    orderHow,
    staleness,
    tags,
    registeredWith,
    filter,
    fields,
    options,
  );

const getTags = async ({
  tags,
  orderBy,
  orderHow,
  perPage,
  page,
  staleness,
  search,
  displayName,
  fqdn,
  hostnameOrId,
  insightsId,
  providerId,
  providerType,
  updatedStart,
  updatedEnd,
  groupName,
  registeredWith,
  filter,
  options: { axios, ...options } = {},
} = {}) =>
  await hostInventoryApi(axios).apiTagGetTags(
    tags,
    orderBy,
    orderHow,
    perPage,
    page,
    staleness,
    search,
    displayName,
    fqdn,
    hostnameOrId,
    insightsId,
    providerId,
    providerType,
    updatedStart,
    updatedEnd,
    groupName,
    registeredWith,
    filter,
    options,
  );

const getDefaultStaleness = async ({
  options: { axios, ...options } = {},
} = {}) =>
  await hostInventoryApi(axios).apiStalenessGetDefaultStaleness({ options });

const createStaleness = async ({
  stalenessIn,
  options: { axios, ...options } = {},
}) =>
  await hostInventoryApi(axios).apiStalenessCreateStaleness(
    stalenessIn,
    options,
  );

const updateStaleness = async ({
  stalenessIn,
  options: { axios, ...options } = {},
}) =>
  await hostInventoryApi(axios).apiStalenessUpdateStaleness(
    stalenessIn,
    options,
  );

const getStaleness = async ({ options: { axios, ...options } = {} } = {}) =>
  await hostInventoryApi(axios).apiStalenessGetStaleness({ options });

const patchHostById = async ({
  hostIdList,
  patchHostIn,
  branchId,
  options: { axios, ...options } = {},
}) =>
  await hostInventoryApi(axios).apiHostPatchHostById(
    hostIdList,
    patchHostIn,
    branchId,
    options,
  );

const deleteHostById = async ({
  hostIdList,
  branchId,
  options: { axios, ...options } = {},
}) =>
  await hostInventoryApi(axios).apiHostDeleteHostById(
    hostIdList,
    branchId,
    options,
  );

const getGroupList = async ({
  name,
  perPage,
  page,
  orderBy,
  orderHow,
  groupType,
  options: { axios, ...options } = {},
} = {}) =>
  await hostInventoryApi(axios).apiGroupGetGroupList(
    name,
    perPage,
    page,
    orderBy,
    orderHow,
    groupType,
    options,
  );

const getGroupsById = async ({
  groupIdList,
  perPage,
  page,
  orderBy,
  orderHow,
  options: { axios, ...options } = {},
}) =>
  await hostInventoryApi(axios).apiGroupGetGroupsById(
    groupIdList,
    perPage,
    page,
    orderBy,
    orderHow,
    options,
  );

const createGroup = async ({ groupIn, options: { axios, ...options } = {} }) =>
  await hostInventoryApi(axios).apiGroupCreateGroup(groupIn, options);

const patchGroupById = async ({
  groupId,
  groupIn,
  options: { axios, ...options } = {},
}) =>
  await hostInventoryApi(axios).apiGroupPatchGroupById(
    groupId,
    groupIn,
    options,
  );

const deleteGroups = async ({
  groupIdList,
  options: { axios, ...options } = {},
}) => await hostInventoryApi(axios).apiGroupDeleteGroups(groupIdList, options);

const addHostListToGroup = async ({
  groupId,
  requestBody,
  options: { axios, ...options } = {},
}) =>
  await hostInventoryApi(axios).apiHostGroupAddHostListToGroup(
    groupId,
    requestBody,
    options,
  );

const deleteHostsFromGroup = async ({
  groupId,
  hostIdList,
  options: { axios, ...options } = {},
}) =>
  await hostInventoryApi(axios).apiHostGroupDeleteHostsFromGroup(
    groupId,
    hostIdList,
    options,
  );

const getOperatingSystem = async ({
  tags,
  perPage,
  page,
  staleness,
  registeredWith,
  filter,
  options: { axios, ...options } = {},
} = {}) =>
  await hostInventoryApi(axios).apiSystemProfileGetOperatingSystem(
    tags,
    perPage,
    page,
    staleness,
    registeredWith,
    filter,
    options,
  );

export {
  hostInventoryApi,
  getHostSystemProfileById,
  getHostTags,
  getHostById,
  getHostList,
  getTags,
  getDefaultStaleness,
  createStaleness,
  updateStaleness,
  getStaleness,
  patchHostById,
  deleteHostById,
  getGroupList,
  getGroupsById,
  createGroup,
  patchGroupById,
  deleteGroups,
  addHostListToGroup,
  deleteHostsFromGroup,
  getOperatingSystem,
};
