import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared';
import axiosInstance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import * as clientExports from '@redhat-cloud-services/host-inventory-client';
import type { AxiosInstance } from 'axios';
import type {
  ApiHostGetHostListParams,
  ApiHostGetHostListReturnType,
} from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import type {
  ApiHostGetHostTagsParams,
  ApiHostGetHostTagsReturnType,
} from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostTags';
import {
  ApiGroupGetGroupListParams,
  ApiGroupGetGroupListReturnType,
} from '@redhat-cloud-services/host-inventory-client/ApiGroupGetGroupList';

export type {
  HostOut,
  TagsOut,
  // Add other types you need from the client package
} from '@redhat-cloud-services/host-inventory-client';

const INVENTORY_API_BASE = '/api/inventory/v1';

type FunctionProperties<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type ApiEndpoints = Pick<
  typeof clientExports,
  FunctionProperties<typeof clientExports>
>;

const endpoints = Object.fromEntries(
  Object.entries(clientExports).filter(
    ([, value]) => typeof value === 'function',
  ),
) as ApiEndpoints;

const hostInventoryApi = (axios: AxiosInstance = axiosInstance) =>
  APIFactory(INVENTORY_API_BASE, endpoints, {
    axios,
  });

// See API docs https://console.redhat.com/docs/api/inventory/

export const getHostList = async (
  params: ApiHostGetHostListParams = {},
): Promise<ApiHostGetHostListReturnType> => {
  // type asserted because interceptor unwraps AxiosResponse in runtime
  return (await hostInventoryApi().apiHostGetHostList(
    params,
  )) as unknown as ApiHostGetHostListReturnType;
};

export const getHostTags = async (
  params: ApiHostGetHostTagsParams = { hostIdList: [] },
): Promise<ApiHostGetHostTagsReturnType> => {
  // type asserted because interceptor unwraps AxiosResponse in runtime
  return (await hostInventoryApi().apiHostGetHostTags(
    params,
  )) as unknown as ApiHostGetHostTagsReturnType;
};

export const getGroupList = async (
  params: ApiGroupGetGroupListParams = {},
): Promise<ApiGroupGetGroupListReturnType> => {
  // type asserted because interceptor unwraps AxiosResponse in runtime
  return (await hostInventoryApi().apiGroupGetGroupList(
    params,
  )) as unknown as ApiGroupGetGroupListReturnType;
};
