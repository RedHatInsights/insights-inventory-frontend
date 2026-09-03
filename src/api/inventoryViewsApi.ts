import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared';
import axiosInstance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import {
  apiViewsGetViewsList,
  apiViewsGetViewById,
  apiViewsCreateView,
  apiViewsPatchView,
  apiViewsDeleteView,
} from '@redhat-cloud-services/host-inventory-client';
import type { AxiosInstance } from 'axios';
import type {
  ApiViewsGetViewsListParams,
  ApiViewsGetViewsListReturnType,
} from '@redhat-cloud-services/host-inventory-client/ApiViewsGetViewsList';
import type {
  ApiViewsGetViewByIdParams,
  ApiViewsGetViewByIdReturnType,
} from '@redhat-cloud-services/host-inventory-client/ApiViewsGetViewById';
import type { ApiViewsCreateViewReturnType } from '@redhat-cloud-services/host-inventory-client/ApiViewsCreateView';
import type { ApiViewsPatchViewReturnType } from '@redhat-cloud-services/host-inventory-client/ApiViewsPatchView';
import type {
  ViewConfiguration,
  ViewIn,
  ViewOut,
  ViewPatch,
  ViewsListOut,
} from '@redhat-cloud-services/host-inventory-client/types';
import { INVENTORY_API_BASE } from '../config';

export type { ViewConfiguration, ViewIn, ViewOut, ViewPatch, ViewsListOut };

export type CreateViewRequest = ViewIn;
export type UpdateViewRequest = ViewPatch;
export type InventoryView = ViewOut;

export const ALL_SYSTEMS_VIEW_ID = 'all-systems';

export const ALL_SYSTEMS_CONFIGURATION: ViewConfiguration = {
  columns: [
    { key: 'display_name' },
    { key: 'group_name' },
    { key: 'tags' },
    { key: 'operating_system' },
    { key: 'last_check_in' },
  ],
};

const endpoints = {
  apiViewsGetViewsList,
  apiViewsGetViewById,
  apiViewsCreateView,
  apiViewsPatchView,
  apiViewsDeleteView,
};

const inventoryApi = (axios: AxiosInstance = axiosInstance) =>
  APIFactory(INVENTORY_API_BASE, endpoints, { axios });

export const listViewsApi = async (
  params: ApiViewsGetViewsListParams = {},
): Promise<ApiViewsGetViewsListReturnType> => {
  return (await inventoryApi().apiViewsGetViewsList(
    params,
  )) as unknown as ApiViewsGetViewsListReturnType;
};

export const getViewApi = async (
  params: ApiViewsGetViewByIdParams,
): Promise<ApiViewsGetViewByIdReturnType> => {
  return (await inventoryApi().apiViewsGetViewById(
    params,
  )) as unknown as ApiViewsGetViewByIdReturnType;
};

export const createViewApi = async (
  data: CreateViewRequest,
): Promise<ApiViewsCreateViewReturnType> => {
  return (await inventoryApi().apiViewsCreateView({
    viewIn: data,
  })) as unknown as ApiViewsCreateViewReturnType;
};

export const updateViewApi = async (
  id: string,
  data: UpdateViewRequest,
): Promise<ApiViewsPatchViewReturnType> => {
  return (await inventoryApi().apiViewsPatchView({
    viewId: id,
    viewPatch: data,
  })) as unknown as ApiViewsPatchViewReturnType;
};

export const deleteViewApi = async (id: string): Promise<void> => {
  await inventoryApi().apiViewsDeleteView({ viewId: id });
};
