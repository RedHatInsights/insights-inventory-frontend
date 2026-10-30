import type { ApiHostViewsGetHostViewsParams } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import { bindInventoryHostViewsFilters } from '../SystemsView/filters/inventory/bindInventoryFilters';
import { bindAdvisorFilters } from '../SystemsView/filters/advisor/bindAdvisorFilters';
import type { FilterSelector } from '../SystemsView/filters/resolveFilterSelector';
import { bindVulnerabilityFilters } from '../SystemsView/filters/vulnerability/bindVulnerabilityFilter';
import { bindContentFilters } from '../SystemsView/filters/content/bindContentFilters';

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
  ...bindInventoryHostViewsFilters(catalog),
  ...bindAdvisorFilters(catalog),
  ...bindVulnerabilityFilters(catalog),
  ...bindContentFilters(catalog),
];
