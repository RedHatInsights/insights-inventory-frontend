import type { SystemProfileFilter } from '../../../InventoryViews/utils/buildSystemProfileFilters';

type SystemProfileFragment = {
  options?: {
    params?: {
      filter?: {
        system_profile?: SystemProfileFilter;
      };
    };
  };
};

/**
 * Builds a `filter.system_profile` fragment onto an in-progress host query.
 * Used by OS and workload `updateFilterParams` reducers so they can compose.
 *  @param query    Query accumulated by earlier bindings
 *  @param fragment Profile filter keys to merge
 *  @returns        Query with `options.params.filter.system_profile` updated
 */
export const buildSystemProfileParam = <
  TFilterParams extends SystemProfileFragment,
>(
  query: TFilterParams,
  fragment: SystemProfileFilter,
): TFilterParams => {
  const existing = query.options?.params?.filter?.system_profile;

  return {
    ...query,
    options: {
      ...query.options,
      params: {
        ...query.options?.params,
        filter: {
          ...query.options?.params?.filter,
          system_profile: {
            ...existing,
            ...fragment,
          },
        },
      },
    },
  };
};

/**
 * Reads the system-profile filter fragment written by inventory `updateFilterParams`.
 *  @param query - Folded host list or host-views query
 *  @returns     Nested `system_profile` filter, or `undefined` when unset
 */
export const getSystemProfileFilter = (
  query: SystemProfileFragment,
): SystemProfileFilter | undefined =>
  query.options?.params?.filter?.system_profile as
    | SystemProfileFilter
    | undefined;
