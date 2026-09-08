import type { SystemsViewFilterState } from '../../SystemsView/types';
import {
  buildOperatingSystemProfileFilter,
  type OperatingSystemProfileFilter,
} from '../../SystemsView/utils/operatingSystemSelectOptions';
import {
  buildWorkloadsFilter,
  type WorkloadsPresenceFilter,
} from '../../SystemsView/utils/workloadsFilter';

/** Nested `filter.system_profile` fragment for host list and host-view APIs. */
export type SystemProfileFilter = {
  rhc_client_id?: string[];
  operating_system?: OperatingSystemProfileFilter;
  workloads?: WorkloadsPresenceFilter;
};

const asStringList = (value: unknown): string[] | undefined =>
  Array.isArray(value) ? value.map(String) : undefined;

/**
 * Maps toolbar RHC, OS, and workload filters to `filter.system_profile` for host APIs.
 *
 *  @param filters - Toolbar filter state for RHC status, operating system, and workloads.
 *  @returns       Profile filter or `undefined` when there is nothing to filter.
 */
export const buildSystemProfileFilters = (
  filters: SystemsViewFilterState,
): SystemProfileFilter | undefined => {
  const rhcStatus = asStringList(filters.rhcStatus);
  const operatingSystemFilter = buildOperatingSystemProfileFilter(
    asStringList(filters.operating_system),
  );
  const workloadsFilter = buildWorkloadsFilter(asStringList(filters.workloads));

  const systemProfileFilter: SystemProfileFilter = {
    ...(rhcStatus?.length && { rhc_client_id: rhcStatus }),
    ...(operatingSystemFilter && { operating_system: operatingSystemFilter }),
    ...(workloadsFilter && { workloads: workloadsFilter }),
  };

  return Object.keys(systemProfileFilter).length > 0
    ? systemProfileFilter
    : undefined;
};
