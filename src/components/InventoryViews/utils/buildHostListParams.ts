import {
  type ApiHostGetHostListParams,
  ApiHostGetHostListOrderByEnum,
} from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import type { SortDirection } from '../../SystemsView/SystemsView';
import { buildHostQueryOptions } from './buildHostListOptions';
import { getSystemProfileFilter } from '../../SystemsView/filters/inventory/buildSystemProfileParam';

const HOST_LIST_SYSTEM_PROFILE_FIELDS = [
  'operating_system',
  'system_update_method',
  'bootc_status',
  'host_type',
] as const;

export interface BuildHostListParamsInput {
  page: number;
  perPage: number;
  query: ApiHostGetHostListParams;
  sortBy?: ApiHostGetHostListOrderByEnum;
  direction?: SortDirection;
}

export const buildHostListParams = ({
  page,
  perPage,
  query,
  sortBy,
  direction,
}: BuildHostListParamsInput): ApiHostGetHostListParams => {
  const { options: queryOptions, ...filterQuery } = query;

  return {
    ...filterQuery,
    page,
    perPage,
    ...(sortBy && { orderBy: sortBy }),
    ...(direction && { orderHow: direction.toUpperCase() }),
    options: buildHostQueryOptions(
      HOST_LIST_SYSTEM_PROFILE_FIELDS,
      getSystemProfileFilter({ options: queryOptions }),
    ),
  };
};
