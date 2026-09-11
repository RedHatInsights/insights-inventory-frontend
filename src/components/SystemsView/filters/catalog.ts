import { bindFilter } from './bindFilter';
import type {
  BoundFilter,
  FilterBinding,
  FilterSpec,
  LastSeenSelectValue,
} from './types';
import {
  hostnameSpec,
  lastSeenSpec,
  operatingSystemSpec,
  sourceSpec,
  statusSpec,
  systemTypeSpec,
  tagsSpec,
  workloadsSpec,
  workspaceSpec,
} from './inventory/filterDefinitions';

/**
 * Shared filter factories. Bind a consumer query with `updateFilterParams`.
 * Inventory uses `bindInventoryHostListFilters` / `bindInventoryHostViewsFilters`;
 * other apps should use this catalog. Use `custom` for a filter that is not
 * one of the named factories.
 */
export type FilterCatalog = {
  hostname: <TFilterParams>(
    binding: FilterBinding<TFilterParams, string>,
  ) => BoundFilter<TFilterParams>;
  status: <TFilterParams>(
    binding: FilterBinding<TFilterParams, string[]>,
  ) => BoundFilter<TFilterParams>;
  operatingSystem: <TFilterParams>(
    binding: FilterBinding<TFilterParams, string[]>,
  ) => BoundFilter<TFilterParams>;
  source: <TFilterParams>(
    binding: FilterBinding<TFilterParams, string[]>,
  ) => BoundFilter<TFilterParams>;
  systemType: <TFilterParams>(
    binding: FilterBinding<TFilterParams, string[]>,
  ) => BoundFilter<TFilterParams>;
  workspace: <TFilterParams>(
    binding: FilterBinding<TFilterParams, string[]>,
  ) => BoundFilter<TFilterParams>;
  lastSeen: <TFilterParams>(
    binding: FilterBinding<TFilterParams, LastSeenSelectValue>,
  ) => BoundFilter<TFilterParams>;
  tags: <TFilterParams>(
    binding: FilterBinding<TFilterParams, string[]>,
  ) => BoundFilter<TFilterParams>;
  workloads: <TFilterParams>(
    binding: FilterBinding<TFilterParams, string[]>,
  ) => BoundFilter<TFilterParams>;
  /**
   * Escape hatch for filters that are not in the shared catalog.
   * Same as `bindFilter`; keeps ad-hoc definitions inside the selector.
   */
  custom: <TFilterParams, TValue>(
    spec: FilterSpec,
    binding: FilterBinding<TFilterParams, TValue>,
  ) => BoundFilter<TFilterParams>;
};

export const filterCatalog: FilterCatalog = {
  hostname: (binding) => bindFilter(hostnameSpec, binding),
  status: (binding) => bindFilter(statusSpec, binding),
  operatingSystem: (binding) => bindFilter(operatingSystemSpec, binding),
  source: (binding) => bindFilter(sourceSpec, binding),
  systemType: (binding) => bindFilter(systemTypeSpec, binding),
  workspace: (binding) => bindFilter(workspaceSpec, binding),
  lastSeen: (binding) => bindFilter(lastSeenSpec, binding),
  tags: (binding) => bindFilter(tagsSpec, binding),
  workloads: (binding) => bindFilter(workloadsSpec, binding),
  custom: bindFilter,
};
