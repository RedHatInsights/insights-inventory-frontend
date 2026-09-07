import type { ApiHostViewsGetHostViewsParams } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import { bindInventoryHostViewsFilters } from '../SystemsView/filters/inventory/bindInventoryFilters';
import type { FilterSelector } from '../SystemsView/filters/resolveFilterSelector';

/**
 * Full inventory toolbar for `/hosts/views`.
 */
export const selectInventoryViewsFilters: FilterSelector<ApiHostViewsGetHostViewsParams> =
  bindInventoryHostViewsFilters;
