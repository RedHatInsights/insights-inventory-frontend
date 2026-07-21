import {
  ApiHostViewsGetHostViewsOrderByEnum,
  ApiHostViewsGetHostViewsRegisteredWithEnum,
  ApiHostViewsGetHostViewsSystemTypeEnum,
  type ApiHostViewsGetHostViewsParams,
} from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import type { Column } from '../../SystemsView/columns/allColumnDefinitions';
import type { InventoryFilters } from '../../SystemsView/filters/SystemsViewFilters';
import type { LastSeenCustomRange } from '../../SystemsView/DataViewFiltersContext';
import type { SortDirection } from '../../SystemsView/SystemsView';
import { buildSystemProfileFilters } from './buildSystemProfileFilters';
import { buildHostQueryOptions } from './buildHostListOptions';
import { lastSeenKeysToApiParams } from './lastSeenKeysToApiParams';
import { buildSystemType } from './buildSystemType';
import { buildGroupIdParam } from './buildGroupIdParam';

const HOST_VIEWS_SYSTEM_PROFILE_FIELDS = [
  'operating_system',
  'system_update_method',
  'bootc_status',
  'host_type',
  'infrastructure_type',
  'infrastructure_vendor',
  'workloads',
] as const;

const COLUMN_SORT_BY_TO_API_ORDER_BY: Partial<
  Record<NonNullable<Column['sortBy']>, ApiHostViewsGetHostViewsOrderByEnum>
> = {
  status: ApiHostViewsGetHostViewsOrderByEnum.LastCheckIn,
};

export interface BuildHostViewsParamsInput {
  page: number;
  perPage: number;
  filters: InventoryFilters;
  lastSeenCustomRange: LastSeenCustomRange;
  sortBy?: ApiHostViewsGetHostViewsOrderByEnum;
  direction?: SortDirection;
}

export const buildHostViewsParams = ({
  page,
  perPage,
  filters,
  lastSeenCustomRange,
  sortBy,
  direction,
}: BuildHostViewsParamsInput): ApiHostViewsGetHostViewsParams => {
  const systemProfileFilters = buildSystemProfileFilters(filters);
  const lastSeenParams = lastSeenKeysToApiParams(
    filters.last_seen,
    lastSeenCustomRange,
  );
  const { groupId } = buildGroupIdParam(filters.group_id);

  return {
    page,
    perPage,
    ...(sortBy && {
      orderBy: COLUMN_SORT_BY_TO_API_ORDER_BY[sortBy] ?? sortBy,
    }),
    ...(direction && { orderHow: direction.toUpperCase() }),
    ...(filters.hostname_or_id && { hostnameOrId: filters.hostname_or_id }),
    ...(filters.status?.length && {
      staleness: filters.status,
    }),
    ...(filters.source?.length && {
      registeredWith:
        filters.source as ApiHostViewsGetHostViewsRegisteredWithEnum[],
    }),
    ...(filters.system_type?.length && {
      systemType: buildSystemType(
        filters.system_type,
        Object.values(ApiHostViewsGetHostViewsSystemTypeEnum),
      ),
    }),
    ...(groupId && { workspaceId: groupId }),
    ...(filters.tags && { tags: filters.tags }),
    ...(lastSeenParams ?? {}),
    options: buildHostQueryOptions(
      HOST_VIEWS_SYSTEM_PROFILE_FIELDS,
      systemProfileFilters,
    ),
  };
};
