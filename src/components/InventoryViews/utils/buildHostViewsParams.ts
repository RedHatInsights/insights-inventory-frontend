import type { ApiHostViewsGetHostViewsParams } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import { getSystemProfileFilter } from '../../SystemsView/filters/inventory/buildSystemProfileParam';
import { buildHostQueryOptions } from './buildHostListOptions';

const HOST_VIEWS_SYSTEM_PROFILE_FIELDS = [
  'operating_system',
  'system_update_method',
  'bootc_status',
  'host_type',
  'infrastructure_type',
  'infrastructure_vendor',
  'workloads',
] as const;

/**
 * Strips the filter-written `options` fragment and attaches host-views query options.
 * Page and sort are already on `query` and pass through.
 *  @param query - Folded host-views query, including page and sort
 *  @returns     Host-views params with rebuilt query options
 */
export const buildHostViewsParams = (
  query: ApiHostViewsGetHostViewsParams,
): ApiHostViewsGetHostViewsParams => {
  const { options: queryOptions, ...filterQuery } = query;

  return {
    ...filterQuery,
    options: buildHostQueryOptions(
      HOST_VIEWS_SYSTEM_PROFILE_FIELDS,
      getSystemProfileFilter({ options: queryOptions }),
    ),
  };
};
