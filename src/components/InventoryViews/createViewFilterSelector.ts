import type { ViewConfiguration } from '../../api/inventoryViewsApi';
import type { FilterSelector } from '../SystemsView/filters/resolveFilterSelector';
import { applyFilterDefaultValues } from '../SystemsView/filters/applyFilterDefaultValues';
import type { FilterSpec } from '../SystemsView/filters/types';
import { selectInventoryViewsFilters } from './selectInventoryViewsFilters';
import type { ApiHostViewsGetHostViewsParams } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import { parseViewConfigFilters } from './utils/viewConfigFilters';

/**
 * Restores a saved view's toolbar
 *
 *  @param configuration - Active view configuration; `undefined` skips restore
 *  @param baseSelector  - Toolbar membership to restore onto; defaults to the
 *                       full toolbar. Pass the flag-resolved selector so a
 *                       view saved with app-data filters does not reintroduce
 *                       them while `ui.inventory-views-filters` is off.
 *  @returns             Selector, or `undefined` when there is no configuration
 */
export const createViewFilterSelector = (
  configuration?: ViewConfiguration,
  baseSelector: FilterSelector<ApiHostViewsGetHostViewsParams> = selectInventoryViewsFilters,
): FilterSelector<ApiHostViewsGetHostViewsParams> | undefined => {
  if (!configuration) {
    return undefined;
  }

  const applied = parseViewConfigFilters(configuration.filters);
  if (!applied) {
    return baseSelector;
  }

  return applyFilterDefaultValues(
    baseSelector,
    applied as Readonly<Record<string, FilterSpec['defaultValue']>>,
  );
};
