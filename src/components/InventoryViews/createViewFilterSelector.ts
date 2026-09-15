import type { ApiHostViewsGetHostViewsParams } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import type { ViewConfiguration } from '../../api/inventoryViewsApi';
import type { FilterSelector } from '../SystemsView/filters/resolveFilterSelector';
import { applyFilterDefaultValues } from '../SystemsView/filters/applyFilterDefaultValues';
import type { FilterSpec } from '../SystemsView/filters/types';
import { selectInventoryViewsFilters } from './selectInventoryViewsFilters';
import { parseViewConfigFilters } from './utils/viewConfigFilters';

/**
 * Restores a saved view's toolbar
 *
 *  @param configuration - Active view configuration; `undefined` skips restore
 *  @returns             Selector, or `undefined` when there is no configuration
 */
export const createViewFilterSelector = (
  configuration?: ViewConfiguration,
): FilterSelector<ApiHostViewsGetHostViewsParams> | undefined => {
  if (!configuration) {
    return undefined;
  }

  const applied = parseViewConfigFilters(configuration.filters);
  if (!applied) {
    return selectInventoryViewsFilters;
  }

  return applyFilterDefaultValues(
    selectInventoryViewsFilters,
    applied as Readonly<Record<string, FilterSpec['defaultValue']>>,
  );
};
