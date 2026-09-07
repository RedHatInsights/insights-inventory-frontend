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
  rhcStatusSpec,
  sourceSpec,
  statusSpec,
  systemTypeSpec,
  tagsSpec,
  workloadsSpec,
  workspaceSpec,
} from './inventory/filterDefinitions';

/**
 * Shared filter factories. Bind a consumer query with `updateQuery`.
 * Inventory uses `bindInventoryHostListFilters` / `bindInventoryHostViewsFilters`;
 * other apps should use this catalog. Use `custom` for a filter that is not
 * one of the named factories.
 */
export type FilterCatalog = {
  hostname: <TQuery>(
    binding: FilterBinding<TQuery, string>,
  ) => BoundFilter<TQuery>;
  status: <TQuery>(
    binding: FilterBinding<TQuery, string[]>,
  ) => BoundFilter<TQuery>;
  operatingSystem: <TQuery>(
    binding: FilterBinding<TQuery, string[]>,
  ) => BoundFilter<TQuery>;
  source: <TQuery>(
    binding: FilterBinding<TQuery, string[]>,
  ) => BoundFilter<TQuery>;
  rhcStatus: <TQuery>(
    binding: FilterBinding<TQuery, string[]>,
  ) => BoundFilter<TQuery>;
  systemType: <TQuery>(
    binding: FilterBinding<TQuery, string[]>,
  ) => BoundFilter<TQuery>;
  workspace: <TQuery>(
    binding: FilterBinding<TQuery, string[]>,
  ) => BoundFilter<TQuery>;
  lastSeen: <TQuery>(
    binding: FilterBinding<TQuery, LastSeenSelectValue>,
  ) => BoundFilter<TQuery>;
  tags: <TQuery>(
    binding: FilterBinding<TQuery, string[]>,
  ) => BoundFilter<TQuery>;
  workloads: <TQuery>(
    binding: FilterBinding<TQuery, string[]>,
  ) => BoundFilter<TQuery>;
  /**
   * Escape hatch for filters that are not in the shared catalog.
   * Same as `bindFilter`; keeps ad-hoc definitions inside the selector.
   */
  custom: <TQuery, TValue>(
    spec: FilterSpec,
    binding: FilterBinding<TQuery, TValue>,
  ) => BoundFilter<TQuery>;
};

export const filterCatalog: FilterCatalog = {
  hostname: (binding) => bindFilter(hostnameSpec, binding),
  status: (binding) => bindFilter(statusSpec, binding),
  operatingSystem: (binding) => bindFilter(operatingSystemSpec, binding),
  source: (binding) => bindFilter(sourceSpec, binding),
  rhcStatus: (binding) => bindFilter(rhcStatusSpec, binding),
  systemType: (binding) => bindFilter(systemTypeSpec, binding),
  workspace: (binding) => bindFilter(workspaceSpec, binding),
  lastSeen: (binding) => bindFilter(lastSeenSpec, binding),
  tags: (binding) => bindFilter(tagsSpec, binding),
  workloads: (binding) => bindFilter(workloadsSpec, binding),
  custom: bindFilter,
};
