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
 * Full inventory toolbar bound to `/hosts` list `updateQuery`.
 *  @param catalog - Shared filter catalog of named factories
 *  @returns       Bound host-list filters in toolbar order
 */
export const bindInventoryHostListFilters = (
  catalog: FilterCatalog,
): BoundFilter<ApiHostGetHostListParams>[] => [
  catalog.hostname({
    updateQuery: (query, value) => ({
      ...query,
      ...(value && { hostnameOrId: value }),
    }),
  }),
  catalog.status({
    updateQuery: (query, value) => ({
      ...query,
      ...(value.length > 0 && {
        staleness: value as ApiHostGetHostListStalenessEnum[],
      }),
    }),
  }),
  catalog.operatingSystem({
    updateQuery: (query, value) => {
      const operatingSystem = buildOperatingSystemProfileFilter(value);
      return operatingSystem
        ? buildSystemProfileParam(query, {
            operating_system: operatingSystem,
          })
        : query;
    },
  }),
  catalog.source({
    updateQuery: (query, value) => ({
      ...query,
      ...(value.length > 0 && {
        registeredWith: value as ApiHostGetHostListRegisteredWithEnum[],
      }),
    }),
  }),
  catalog.rhcStatus({
    updateQuery: (query, value) =>
      value.length
        ? buildSystemProfileParam(query, { rhc_client_id: value })
        : query,
  }),
  catalog.systemType({
    updateQuery: (query, value) => ({
      ...query,
      ...(value && {
        systemType: buildSystemType(
          value,
          Object.values(ApiHostGetHostListSystemTypeEnum),
        ),
      }),
    }),
  }),
  catalog.workspace({
    updateQuery: (query, value) => ({
      ...query,
      ...buildGroupIdParam(value),
    }),
  }),
  catalog.lastSeen({
    updateQuery: (query, value) => ({
      ...query,
      ...(lastSeenKeysToApiParams(value.key, value.range) ?? {}),
    }),
  }),
  catalog.tags({
    updateQuery: (query, value) => ({
      ...query,
      ...(value && { tags: value }),
    }),
  }),
  catalog.workloads({
    updateQuery: (query, value) => {
      const workloads = buildWorkloadsFilter(value);
      return workloads ? buildSystemProfileParam(query, { workloads }) : query;
    },
  }),
];

/**
 * Full inventory toolbar bound to `/hosts/views` `updateQuery`.
 *  @param catalog - Shared filter catalog of named factories
 *  @returns       Bound host-views filters in toolbar order
 */
export const bindInventoryHostViewsFilters = (
  catalog: FilterCatalog,
): BoundFilter<ApiHostViewsGetHostViewsParams>[] => [
  catalog.hostname({
    updateQuery: (query, value) => ({
      ...query,
      ...(value && { hostnameOrId: value }),
    }),
  }),
  catalog.status({
    updateQuery: (query, value) => ({
      ...query,
      ...(value?.length && {
        staleness: value as ApiHostViewsGetHostViewsStalenessEnum[],
      }),
    }),
  }),
  catalog.operatingSystem({
    updateQuery: (query, value) => {
      const operatingSystem = buildOperatingSystemProfileFilter(value);
      return operatingSystem
        ? buildSystemProfileParam(query, {
            operating_system: operatingSystem,
          })
        : query;
    },
  }),
  catalog.source({
    updateQuery: (query, value) => ({
      ...query,
      ...(value?.length && {
        registeredWith: value as ApiHostViewsGetHostViewsRegisteredWithEnum[],
      }),
    }),
  }),
  catalog.rhcStatus({
    updateQuery: (query, value) =>
      value?.length
        ? buildSystemProfileParam(query, { rhc_client_id: value })
        : query,
  }),
  catalog.systemType({
    updateQuery: (query, value) => ({
      ...query,
      ...(value?.length && {
        systemType: buildSystemType(
          value,
          Object.values(ApiHostViewsGetHostViewsSystemTypeEnum),
        ),
      }),
    }),
  }),
  catalog.workspace({
    updateQuery: (query, value) => {
      const { groupId } = buildGroupIdParam(value);
      return {
        ...query,
        ...(groupId && { workspaceId: groupId }),
      };
    },
  }),
  catalog.lastSeen({
    updateQuery: (query, value) => ({
      ...query,
      ...(lastSeenKeysToApiParams(value.key, value.range) ?? {}),
    }),
  }),
  catalog.tags({
    updateQuery: (query, value) => ({
      ...query,
      ...(value && { tags: value }),
    }),
  }),
  catalog.workloads({
    updateQuery: (query, value) => {
      const workloads = buildWorkloadsFilter(value);
      return workloads ? buildSystemProfileParam(query, { workloads }) : query;
    },
  }),
];
