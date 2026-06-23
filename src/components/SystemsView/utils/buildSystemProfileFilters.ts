import type { InventoryFilters } from '../filters/SystemsViewFilters';
import {
  buildOperatingSystemProfileFilter,
  type OperatingSystemProfileFilter,
} from './operatingSystemSelectOptions';
import {
  buildWorkloadsFilter,
  type WorkloadsPresenceFilter,
} from './workloadsFilter';

export type SystemProfileFilterInput = Pick<
  InventoryFilters,
  'rhcStatus' | 'operating_system' | 'workloads'
>;

/** Nested `filter.system_profile` fragment for host list and host-view APIs. */
export type SystemProfileFilter = {
  rhc_client_id?: string[];
  operating_system?: OperatingSystemProfileFilter;
  workloads?: WorkloadsPresenceFilter;
};

/**
 * Maps toolbar RHC, OS, and workload filters to `filter.system_profile` for host APIs.
 *
 *  @param filters - Toolbar filter state for RHC status, operating system, and workloads.
 *  @returns       Profile filter or `undefined` when there is nothing to filter.
 */
export const buildSystemProfileFilters = (
  filters: SystemProfileFilterInput,
): SystemProfileFilter | undefined => {
  const operatingSystemFilter = buildOperatingSystemProfileFilter(
    filters.operating_system,
  );
  const workloadsFilter = buildWorkloadsFilter(filters.workloads);

  const systemProfileFilter: SystemProfileFilter = {
    ...(filters.rhcStatus?.length && {
      rhc_client_id: filters.rhcStatus,
    }),
    ...(operatingSystemFilter && { operating_system: operatingSystemFilter }),
    ...(workloadsFilter && { workloads: workloadsFilter }),
  };

  return Object.keys(systemProfileFilter).length > 0
    ? systemProfileFilter
    : undefined;
};
