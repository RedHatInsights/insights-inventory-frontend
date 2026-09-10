import {
  ApiHostViewsGetHostViewsOrderByEnum,
  type ApiHostViewsGetHostViewsParams,
} from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import type { Column } from '../../SystemsView/columns/types';
import type { SortDirection } from '../../SystemsView/SystemsView';
import { buildHostQueryOptions } from './buildHostListOptions';
import { getSystemProfileFilter } from '../../SystemsView/filters/inventory/buildSystemProfileParam';

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
  query: ApiHostViewsGetHostViewsParams;
  sortBy?: ApiHostViewsGetHostViewsOrderByEnum;
  direction?: SortDirection;
}

export const buildHostViewsParams = ({
  page,
  perPage,
  query,
  sortBy,
  direction,
}: BuildHostViewsParamsInput): ApiHostViewsGetHostViewsParams => {
  const { options: queryOptions, ...filterQuery } = query;

  return {
    ...filterQuery,
    page,
    perPage,
    ...(sortBy && {
      orderBy: COLUMN_SORT_BY_TO_API_ORDER_BY[sortBy] ?? sortBy,
    }),
    ...(direction && { orderHow: direction.toUpperCase() }),
    options: buildHostQueryOptions(
      HOST_VIEWS_SYSTEM_PROFILE_FIELDS,
      getSystemProfileFilter({ options: queryOptions }),
    ),
  };
};
