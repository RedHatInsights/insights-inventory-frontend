import type { ApiHostViewsGetHostViewsParams } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import { bindInventoryHostViewsFilters } from '../SystemsView/filters/inventory/bindInventoryFilters';
import { bindAdvisorFilters } from '../SystemsView/filters/advisor/bindAdvisorFilters';
import type { FilterSelector } from '../SystemsView/filters/resolveFilterSelector';
import { bindVulnerabilityFilters } from '../SystemsView/filters/vulnerability/bindVulnerabilityFilter';

/**
 * Base `/hosts/views` toolbar: inventory filters only, no app-data groups.
 *
 * Used when the `ui.inventory-views-filters` feature flag is off.
 */
export const selectInventoryViewsBaseFilters: FilterSelector<
  ApiHostViewsGetHostViewsParams
> = (catalog) => [...bindInventoryHostViewsFilters(catalog)];

/**
 * Configuration for the `/hosts/views` toolbar filter groups.
 *
 * Combines base inventory filters with app-specific data groups for display in `InventoryViews`.
 *
 * @remarks The group order here must strictly match `inventoryViewsFilterSpecs`.
 */
export const selectInventoryViewsFilters: FilterSelector<
  ApiHostViewsGetHostViewsParams
> = (catalog) => [
  ...selectInventoryViewsBaseFilters(catalog),
  ...bindAdvisorFilters(catalog),
  ...bindVulnerabilityFilters(catalog),
];

/**
 * Picks the toolbar selector matching the `ui.inventory-views-filters` flag.
 *
 *  @param isAppDataFiltersEnabled - Whether Advisor/Vulnerability filters show
 *  @returns                       Selector for the `/hosts/views` toolbar
 */
export const getInventoryViewsFilterSelector = (
  isAppDataFiltersEnabled: boolean,
): FilterSelector<ApiHostViewsGetHostViewsParams> =>
  isAppDataFiltersEnabled
    ? selectInventoryViewsFilters
    : selectInventoryViewsBaseFilters;
