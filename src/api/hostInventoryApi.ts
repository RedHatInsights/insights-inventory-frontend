import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared';
import axiosInstance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import * as endpoints from '@redhat-cloud-services/host-inventory-client';
import { ApiHostGetHostSystemProfileByIdParams } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostSystemProfileById';
import { ApiHostGetHostTagsParams } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostTags';
import { ApiHostGetHostByIdParams } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostById';
import { ApiHostGetHostListParams } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import { ApiTagGetTagsParams } from '@redhat-cloud-services/host-inventory-client/ApiTagGetTags';
import { ApiStalenessCreateStalenessParams } from '@redhat-cloud-services/host-inventory-client/ApiStalenessCreateStaleness';
import { ApiStalenessGetStalenessParams } from '@redhat-cloud-services/host-inventory-client/ApiStalenessGetStaleness';
import { ApiHostPatchHostByIdParams } from '@redhat-cloud-services/host-inventory-client/ApiHostPatchHostById';
import { ApiHostDeleteHostByIdParams } from '@redhat-cloud-services/host-inventory-client/ApiHostDeleteHostById';
import { ApiStalenessGetDefaultStalenessParams } from '@redhat-cloud-services/host-inventory-client/ApiStalenessGetDefaultStaleness';
import { ApiGroupGetGroupsByIdParams } from '@redhat-cloud-services/host-inventory-client/ApiGroupGetGroupsById';
import { ApiGroupCreateGroupParams } from '@redhat-cloud-services/host-inventory-client/ApiGroupCreateGroup';
import { ApiGroupPatchGroupByIdParams } from '@redhat-cloud-services/host-inventory-client/ApiGroupPatchGroupById';
import { ApiGroupDeleteGroupsParams } from '@redhat-cloud-services/host-inventory-client/ApiGroupDeleteGroups';
import { ApiHostGroupAddHostListToGroupParams } from '@redhat-cloud-services/host-inventory-client/ApiHostGroupAddHostListToGroup';
import { ApiHostGroupDeleteHostsFromGroupParams } from '@redhat-cloud-services/host-inventory-client/ApiHostGroupDeleteHostsFromGroup';
import { ApiGroupGetGroupListParams } from '@redhat-cloud-services/host-inventory-client/ApiGroupGetGroupList';
import { ApiSystemProfileGetOperatingSystemParams } from '@redhat-cloud-services/host-inventory-client/ApiSystemProfileGetOperatingSystem';
import { ApiStalenessUpdateStalenessParams } from '@redhat-cloud-services/host-inventory-client/ApiStalenessUpdateStaleness';

export const INVENTORY_API_BASE = '/api/inventory/v1';

const hostInventoryApi = APIFactory(INVENTORY_API_BASE, endpoints, {
  axios: axiosInstance,
});

const getHostSystemProfileById = async ({
  hostIdList,
  perPage,
  page,
  orderBy,
  orderHow,
  branchId,
  fields,
  options,
}: ApiHostGetHostSystemProfileByIdParams) =>
  await hostInventoryApi.apiHostGetHostSystemProfileById(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
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
  options,
}: ApiHostGetHostTagsParams) =>
  await hostInventoryApi.apiHostGetHostTags(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
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
  options,
}: ApiHostGetHostByIdParams) =>
  await hostInventoryApi.apiHostGetHostById(
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
  options,
}: ApiHostGetHostListParams = {}) =>
  await hostInventoryApi.apiHostGetHostList(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
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
  options,
}: ApiTagGetTagsParams = {}) =>
  await hostInventoryApi.apiTagGetTags(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
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
  options,
}: ApiStalenessGetDefaultStalenessParams = {}) =>
  await hostInventoryApi.apiStalenessGetDefaultStaleness({ options });

const createStaleness = async ({
  stalenessIn,
  options,
}: ApiStalenessCreateStalenessParams) =>
  await hostInventoryApi.apiStalenessCreateStaleness(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
    stalenessIn,
    options,
  );

const updateStaleness = async ({
  stalenessIn,
  options,
}: ApiStalenessUpdateStalenessParams) =>
  await hostInventoryApi.apiStalenessUpdateStaleness(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
    stalenessIn,
    options,
  );

const getStaleness = async ({ options }: ApiStalenessGetStalenessParams = {}) =>
  await hostInventoryApi.apiStalenessGetStaleness({ options }); // object here is the only acceptable type set by openapi-genereator (for unknown reason)

const patchHostById = async ({
  hostIdList,
  patchHostIn,
  branchId,
  options,
}: ApiHostPatchHostByIdParams) =>
  await hostInventoryApi.apiHostPatchHostById(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
    hostIdList,
    patchHostIn,
    branchId,
    options,
  );

const deleteHostById = async ({
  hostIdList,
  branchId,
  options,
}: ApiHostDeleteHostByIdParams) =>
  await hostInventoryApi.apiHostDeleteHostById(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
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
  options,
}: ApiGroupGetGroupListParams = {}) =>
  await hostInventoryApi.apiGroupGetGroupList(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
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
  options,
}: ApiGroupGetGroupsByIdParams) =>
  await hostInventoryApi.apiGroupGetGroupsById(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
    groupIdList,
    perPage,
    page,
    orderBy,
    orderHow,
    options,
  );

const createGroup = async ({ groupIn, options }: ApiGroupCreateGroupParams) =>
  await hostInventoryApi.apiGroupCreateGroup(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
    groupIn,
    options,
  );

const patchGroupById = async ({
  groupId,
  groupIn,
  options,
}: ApiGroupPatchGroupByIdParams) =>
  await hostInventoryApi.apiGroupPatchGroupById(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
    groupId,
    groupIn,
    options,
  );

const deleteGroups = async ({
  groupIdList,
  options,
}: ApiGroupDeleteGroupsParams) =>
  await hostInventoryApi.apiGroupDeleteGroups(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
    groupIdList,
    options,
  );

const addHostListToGroup = async ({
  groupId,
  requestBody,
  options,
}: ApiHostGroupAddHostListToGroupParams) =>
  await hostInventoryApi.apiHostGroupAddHostListToGroup(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
    groupId,
    requestBody,
    options,
  );

const deleteHostsFromGroup = async ({
  groupId,
  hostIdList,
  options,
}: ApiHostGroupDeleteHostsFromGroupParams) =>
  await hostInventoryApi.apiHostGroupDeleteHostsFromGroup(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
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
  options,
}: ApiSystemProfileGetOperatingSystemParams = {}) =>
  await hostInventoryApi.apiSystemProfileGetOperatingSystem(
    // @ts-expect-error The types for the inline paramters are all wrongly marked as required while they can be optional
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
