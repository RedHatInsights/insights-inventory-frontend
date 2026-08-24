import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared';
import axiosInstance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import {
  apiViewsGetViewsList,
  apiViewsGetViewById,
  apiViewsCreateView,
  apiViewsUpdateView,
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
import type { ApiViewsUpdateViewReturnType } from '@redhat-cloud-services/host-inventory-client/ApiViewsUpdateView';
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

export const isAllSystemsView = (
  view: Pick<ViewOut, 'is_system_view' | 'org_id'>,
): boolean => view.is_system_view === true && view.org_id == null;

const endpoints = {
  apiViewsGetViewsList,
  apiViewsGetViewById,
  apiViewsCreateView,
  apiViewsUpdateView,
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
): Promise<ApiViewsUpdateViewReturnType> => {
  return (await inventoryApi().apiViewsUpdateView({
    viewId: id,
    viewPatch: data,
  })) as unknown as ApiViewsUpdateViewReturnType;
};

export const deleteViewApi = async (id: string): Promise<void> => {
  await inventoryApi().apiViewsDeleteView({ viewId: id });
};
