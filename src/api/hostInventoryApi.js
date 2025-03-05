import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared';
import axiosInstance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import {
  apiHostDeleteHostById,
  apiHostGetHostById,
  apiHostGetHostList,
  apiHostGetHostSystemProfileById,
  apiHostGetHostTags,
  apiHostPatchHostById,
  apiStalenessCreateStaleness,
  apiStalenessGetDefaultStaleness,
  apiStalenessGetStaleness,
  apiSystemProfileGetOperatingSystem,
  apiTagGetTags,
} from '@redhat-cloud-services/host-inventory-client';

export const INVENTORY_API_BASE = '/api/inventory/v1';

const hostInventoryApi = APIFactory(
  INVENTORY_API_BASE,
  {
    apiHostGetHostSystemProfileById,
    apiHostGetHostTags,
    apiHostGetHostById,
    apiHostGetHostList,
    apiTagGetTags,
    apiSystemProfileGetOperatingSystem,
    apiStalenessGetDefaultStaleness,
    apiStalenessGetStaleness,
    apiStalenessCreateStaleness,
    apiHostPatchHostById,
    apiHostDeleteHostById,
  },
  { axios: axiosInstance }
);

const getHostSystemProfileById = ({
  hostIdList,
  perPage,
  page,
  orderBy,
  orderHow,
  branchId,
  fields,
  options,
} = {}) =>
  hostInventoryApi.apiHostGetHostSystemProfileById(
    hostIdList,
    perPage,
    page,
    orderBy,
    orderHow,
    branchId,
    fields,
    options
  );

const getHostTags = ({
  hostIdList,
  perPage,
  page,
  orderBy,
  orderHow,
  search,
  options,
} = {}) =>
  hostInventoryApi.apiHostGetHostTags(
    hostIdList,
    perPage,
    page,
    orderBy,
    orderHow,
    search,
    options
  );

const getHostById = ({
  hostIdList,
  branchId,
  perPage,
  page,
  orderBy,
  orderHow,
  fields,
  options,
} = {}) =>
  hostInventoryApi.apiHostGetHostById(
    hostIdList,
    branchId,
    perPage,
    page,
    orderBy,
    orderHow,
    fields,
    options
  );

const getHostList = ({
  displayName,
  fqdn,
  hostnameOrId,
  insightsId,
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
} = {}) =>
  hostInventoryApi.apiHostGetHostList(
    displayName,
    fqdn,
    hostnameOrId,
    insightsId,
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
    options
  );

const getTags = ({
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
} = {}) =>
  hostInventoryApi.apiTagGetTags(
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
    options
  );

const getDefaultStaleness = () =>
  hostInventoryApi.apiStalenessGetDefaultStaleness();

const createStaleness = ({ stalenessIn, options } = {}) =>
  hostInventoryApi.apiStalenessCreateStaleness(stalenessIn, options);

const getStaleness = ({ options } = {}) =>
  hostInventoryApi.apiStalenessGetStaleness({ options });

const patchHostById = ({ hostIdList, patchHostIn, branchId, options } = {}) =>
  hostInventoryApi.apiHostPatchHostById(
    hostIdList,
    patchHostIn,
    branchId,
    options
  );

const deleteHostById = ({ hostIdList, branchId, options } = {}) =>
  hostInventoryApi.apiHostDeleteHostById(hostIdList, branchId, options);

export {
  hostInventoryApi,
  getHostSystemProfileById,
  getHostTags,
  getHostById,
  getHostList,
  getTags,
  getDefaultStaleness,
  createStaleness,
  getStaleness,
  patchHostById,
  deleteHostById,
};
