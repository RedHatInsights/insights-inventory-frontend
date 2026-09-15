import type { ApiHostGetHostListParams } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import { bindInventoryHostListFilters } from '../SystemsView/filters/inventory/bindInventoryFilters';
import type { FilterSelector } from '../SystemsView/filters/resolveFilterSelector';

/**
 * Full inventory toolbar for the classic `/hosts` table.
 */
export const selectLegacyInventoryFilters: FilterSelector<ApiHostGetHostListParams> =
  bindInventoryHostListFilters;
