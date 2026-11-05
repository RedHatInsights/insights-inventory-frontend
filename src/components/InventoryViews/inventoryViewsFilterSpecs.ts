import { inventoryFilterSpecs } from '../SystemsView/filters/inventory/filterDefinitions';
import { advisorFilterSpecs } from '../SystemsView/filters/advisor/filterDefinitions';
import { vulnerabilityFilterSpecs } from '../SystemsView/filters/vulnerability/filterDefinitions';
import type { FilterSpec } from '../SystemsView/filters/types';

/**
 * App-data (Advisor + Vulnerability) toolbar specs, gated behind the
 * `ui.inventory-views-filters` feature flag.
 */
export const inventoryViewsAppDataFilterSpecs: readonly FilterSpec[] = [
  ...advisorFilterSpecs,
  ...vulnerabilityFilterSpecs,
];

/**
 * Toolbar filter specifications for the `/hosts/views` page with the app-data
 * filter groups switched off.
 */
export const inventoryViewsBaseFilterSpecs: readonly FilterSpec[] = [
  ...inventoryFilterSpecs,
];

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
  ...inventoryViewsBaseFilterSpecs,
  ...inventoryViewsAppDataFilterSpecs,
];

/**
 * Picks the toolbar specs matching the `ui.inventory-views-filters` flag.
 *
 *  @param isAppDataFiltersEnabled - Whether Advisor/Vulnerability filters show
 *  @returns                       Specs in toolbar order
 */
export const getInventoryViewsFilterSpecs = (
  isAppDataFiltersEnabled: boolean,
): readonly FilterSpec[] =>
  isAppDataFiltersEnabled
    ? inventoryViewsFilterSpecs
    : inventoryViewsBaseFilterSpecs;
