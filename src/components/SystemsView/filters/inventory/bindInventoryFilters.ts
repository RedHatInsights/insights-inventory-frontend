import {
  ApiHostGetHostListRegisteredWithEnum,
  ApiHostGetHostListStalenessEnum,
  ApiHostGetHostListSystemTypeEnum,
  type ApiHostGetHostListParams,
} from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import {
  ApiHostViewsGetHostViewsRegisteredWithEnum,
  ApiHostViewsGetHostViewsStalenessEnum,
  ApiHostViewsGetHostViewsSystemTypeEnum,
  type ApiHostViewsGetHostViewsParams,
} from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import { buildGroupIdParam } from '../../../InventoryViews/utils/buildGroupIdParam';
import { buildSystemType } from '../../../InventoryViews/utils/buildSystemType';
import { lastSeenKeysToApiParams } from '../../../InventoryViews/utils/lastSeenKeysToApiParams';
import { buildOperatingSystemProfileFilter } from '../../utils/operatingSystemSelectOptions';
import { buildWorkloadsFilter } from '../../utils/workloadsFilter';
import type { FilterCatalog } from '../catalog';
import type { BoundFilter } from '../types';
import { buildSystemProfileParam } from './buildSystemProfileParam';

/**
 * Full inventory toolbar bound to `/hosts` list `updateFilterParams`.
 *  @param catalog - Shared filter catalog of named factories
 *  @returns       Bound host-list filters in toolbar order
 */
export const bindInventoryHostListFilters = (
  catalog: FilterCatalog,
): BoundFilter<ApiHostGetHostListParams>[] => [
  catalog.hostname({
    updateFilterParams: (params, value) => ({
      ...params,
      ...(value && { hostnameOrId: value }),
    }),
  }),
  catalog.status({
    updateFilterParams: (params, value) => ({
      ...params,
      ...(value.length > 0 && {
        staleness: value as ApiHostGetHostListStalenessEnum[],
      }),
    }),
  }),
  catalog.operatingSystem({
    updateFilterParams: (params, value) => {
      const operatingSystem = buildOperatingSystemProfileFilter(value);
      return operatingSystem
        ? buildSystemProfileParam(params, {
            operating_system: operatingSystem,
          })
        : params;
    },
  }),
  catalog.source({
    updateFilterParams: (params, value) => ({
      ...params,
      ...(value.length > 0 && {
        registeredWith: value as ApiHostGetHostListRegisteredWithEnum[],
      }),
    }),
  }),
  catalog.systemType({
    updateFilterParams: (params, value) => ({
      ...params,
      ...(value && {
        systemType: buildSystemType(
          value,
          Object.values(ApiHostGetHostListSystemTypeEnum),
        ),
      }),
    }),
  }),
  catalog.workspace({
    updateFilterParams: (params, value) => ({
      ...params,
      ...buildGroupIdParam(value),
    }),
  }),
  catalog.lastSeen({
    updateFilterParams: (params, value) => ({
      ...params,
      ...(lastSeenKeysToApiParams(value.key, value.range) ?? {}),
    }),
  }),
  catalog.tags({
    updateFilterParams: (params, value) => ({
      ...params,
      ...(value && { tags: value }),
    }),
  }),
  catalog.workloads({
    updateFilterParams: (params, value) => {
      const workloads = buildWorkloadsFilter(value);
      return workloads
        ? buildSystemProfileParam(params, { workloads })
        : params;
    },
  }),
];

/**
 * Full inventory toolbar bound to `/hosts/views` `updateFilterParams`.
 *  @param catalog - Shared filter catalog of named factories
 *  @returns       Bound host-views filters in toolbar order
 */
export const bindInventoryHostViewsFilters = (
  catalog: FilterCatalog,
): BoundFilter<ApiHostViewsGetHostViewsParams>[] => [
  catalog.hostname({
    updateFilterParams: (params, value) => ({
      ...params,
      ...(value && { hostnameOrId: value }),
    }),
  }),
  catalog.status({
    updateFilterParams: (params, value) => ({
      ...params,
      ...(value?.length && {
        staleness: value as ApiHostViewsGetHostViewsStalenessEnum[],
      }),
    }),
  }),
  catalog.operatingSystem({
    updateFilterParams: (params, value) => {
      const operatingSystem = buildOperatingSystemProfileFilter(value);
      return operatingSystem
        ? buildSystemProfileParam(params, {
            operating_system: operatingSystem,
          })
        : params;
    },
  }),
  catalog.source({
    updateFilterParams: (params, value) => ({
      ...params,
      ...(value?.length && {
        registeredWith: value as ApiHostViewsGetHostViewsRegisteredWithEnum[],
      }),
    }),
  }),
  catalog.systemType({
    updateFilterParams: (params, value) => ({
      ...params,
      ...(value?.length && {
        systemType: buildSystemType(
          value,
          Object.values(ApiHostViewsGetHostViewsSystemTypeEnum),
        ),
      }),
    }),
  }),
  catalog.workspace({
    updateFilterParams: (params, value) => {
      const { groupId } = buildGroupIdParam(value);
      return {
        ...params,
        ...(groupId && { workspaceId: groupId }),
      };
    },
  }),
  catalog.lastSeen({
    updateFilterParams: (params, value) => ({
      ...params,
      ...(lastSeenKeysToApiParams(value.key, value.range) ?? {}),
    }),
  }),
  catalog.tags({
    updateFilterParams: (params, value) => ({
      ...params,
      ...(value && { tags: value }),
    }),
  }),
  catalog.workloads({
    updateFilterParams: (params, value) => {
      const workloads = buildWorkloadsFilter(value);
      return workloads
        ? buildSystemProfileParam(params, { workloads })
        : params;
    },
  }),
];
