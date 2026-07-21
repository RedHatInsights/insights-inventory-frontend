import {
  ApiHostGetHostListSystemTypeEnum,
  type ApiHostGetHostListParams,
  ApiHostGetHostListOrderByEnum,
} from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import type { InventoryFilters } from '../../SystemsView/filters/SystemsViewFilters';
import type { LastSeenCustomRange } from '../../SystemsView/DataViewFiltersContext';
import type { SortDirection } from '../../SystemsView/SystemsView';
import { buildSystemProfileFilters } from './buildSystemProfileFilters';
import { buildHostQueryOptions } from './buildHostListOptions';
import { lastSeenKeysToApiParams } from './lastSeenKeysToApiParams';
import { buildSystemType } from './buildSystemType';
import { buildGroupIdParam } from './buildGroupIdParam';

const HOST_LIST_SYSTEM_PROFILE_FIELDS = [
  'operating_system',
  'system_update_method',
  'bootc_status',
  'host_type',
] as const;

export interface BuildHostListParamsInput {
  page: number;
  perPage: number;
  filters: InventoryFilters;
  lastSeenCustomRange: LastSeenCustomRange;
  sortBy?: ApiHostGetHostListOrderByEnum;
  direction?: SortDirection;
}

export const buildHostListParams = ({
  page,
  perPage,
  filters,
  lastSeenCustomRange,
  sortBy,
  direction,
}: BuildHostListParamsInput): ApiHostGetHostListParams => {
  const systemProfileFilters = buildSystemProfileFilters(filters);
  const lastSeenParams = lastSeenKeysToApiParams(
    filters.last_seen,
    lastSeenCustomRange,
  );

  return {
    page,
    perPage,
    ...(sortBy && { orderBy: sortBy }),
    ...(direction && { orderHow: direction.toUpperCase() }),
    ...(filters.hostname_or_id && { hostnameOrId: filters.hostname_or_id }),
    ...(filters.status.length > 0 && { staleness: filters.status }),
    ...(filters.source.length > 0 && { registeredWith: filters.source }),
    ...(filters.system_type && {
      systemType: buildSystemType(
        filters.system_type,
        Object.values(ApiHostGetHostListSystemTypeEnum),
      ),
    }),
    ...buildGroupIdParam(filters.group_id),
    ...(filters.tags && { tags: filters.tags }),
    ...(lastSeenParams ?? {}),
    options: buildHostQueryOptions(
      HOST_LIST_SYSTEM_PROFILE_FIELDS,
      systemProfileFilters,
    ),
  };
};
