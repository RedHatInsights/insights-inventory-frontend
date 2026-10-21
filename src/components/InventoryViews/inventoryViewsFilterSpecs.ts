import { inventoryFilterSpecs } from '../SystemsView/filters/inventory/filterDefinitions';
import { advisorFilterSpecs } from '../SystemsView/filters/advisor/filterDefinitions';
import { vulnerabilityFilterSpecs } from '../SystemsView/filters/vulnerability/filterDefinitions';
import type { FilterSpec } from '../SystemsView/filters/types';

/**
 * Toolbar filter specifications for the `/hosts/views` page.
 *
 * Drives search parameter parsing (`getFiltersFromSearchParams`) and saved-view
 * state management (`FILTER_PARAM_KEYS`).
 *
 * @remarks
 * **Order Dependency:** The sequence of items here must match `selectInventoryViewsFilters`.
 */
export const inventoryViewsFilterSpecs: readonly FilterSpec[] = [
  ...inventoryFilterSpecs,
  ...advisorFilterSpecs,
  ...vulnerabilityFilterSpecs,
];
