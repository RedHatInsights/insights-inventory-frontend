import { useMemo } from 'react';
import type { ViewConfiguration } from '../../../api/inventoryViewsApi';
import { ALL_SYSTEMS_VIEW_ID } from '../../../api/inventoryViewsApi';
import type { InventoryFilters } from '../../SystemsView/filters/SystemsViewFilters';
import type { Column } from '../../SystemsView/columns/types';
import {
  SORT_URL_PARAM,
  SORT_DIR_URL_PARAM,
} from '../../SystemsView/constants';
import { INITIAL_SORT } from '../../SystemsView/hooks/useColumns';
import { INITIAL_INVENTORY_FILTERS } from '../../SystemsView/DataViewFiltersContext';
import { parseViewConfigFilters } from '../utils/viewConfigFilters';

export const FILTER_PARAM_KEYS = Object.keys(INITIAL_INVENTORY_FILTERS);

type ColumnVisibility = Pick<Column, 'key' | 'isShown'>;

interface UseViewDirtyStateParams {
  activeViewId: string;
  savedConfiguration?: ViewConfiguration;
  searchParams: URLSearchParams;
  baselineColumns?: readonly ColumnVisibility[];
  currentColumns?: readonly ColumnVisibility[];
}

export const isSortDirty = (
  searchParams: URLSearchParams,
  savedSort?: ViewConfiguration['sort'],
): boolean => {
  const currentKey = searchParams.get(SORT_URL_PARAM);
  const currentDir = searchParams.get(SORT_DIR_URL_PARAM);

  if (!currentKey && !currentDir) return false;

  const savedKey = savedSort?.key ?? INITIAL_SORT.sortBy;
  const savedDir = savedSort?.direction ?? INITIAL_SORT.direction;

  return (
    (currentKey ?? savedKey) !== savedKey ||
    (currentDir ?? savedDir) !== savedDir
  );
};

export const areFiltersDirty = (
  searchParams: URLSearchParams,
  initialFilters?: Partial<InventoryFilters>,
): boolean => {
  const initial = (initialFilters ?? {}) as Record<string, unknown>;

  for (const key of FILTER_PARAM_KEYS) {
    const current = searchParams.getAll(key).sort();

    const rawSaved = initial[key];
    let saved: string[];
    if (Array.isArray(rawSaved)) {
      saved = rawSaved.map(String).sort();
    } else if (typeof rawSaved === 'string' && rawSaved !== '') {
      saved = [rawSaved];
    } else if (typeof rawSaved === 'object' && rawSaved !== null) {
      // Skip nested objects like system_profile filters - these are handled
      // by DataViewFiltersContext and already synchronized with URL params
      continue;
    } else {
      saved = [];
    }

    if (current.length !== saved.length) return true;
    if (current.some((v, i) => v !== saved[i])) return true;
  }

  return false;
};

export const areColumnsDirty = (
  baselineColumns?: readonly ColumnVisibility[],
  currentColumns?: readonly ColumnVisibility[],
): boolean => {
  if (!baselineColumns || !currentColumns) return false;

  const baselineShownKeys = baselineColumns
    .filter((c) => c.isShown)
    .map((c) => c.key);
  const currentShownKeys = currentColumns
    .filter((c) => c.isShown)
    .map((c) => c.key);

  if (baselineShownKeys.length !== currentShownKeys.length) return true;
  return baselineShownKeys.some((k, i) => k !== currentShownKeys[i]);
};

export const useViewDirtyState = ({
  activeViewId,
  savedConfiguration,
  searchParams,
  baselineColumns,
  currentColumns,
}: UseViewDirtyStateParams) =>
  useMemo(() => {
    // For All Systems view (system view), check if current state differs from defaults
    // For custom views, check if current state differs from saved configuration
    const savedFilters = parseViewConfigFilters(savedConfiguration?.filters);

    const sortIsDirty = isSortDirty(searchParams, savedConfiguration?.sort);
    const filtersAreDirty = areFiltersDirty(searchParams, savedFilters);
    const columnsAreDirty = areColumnsDirty(baselineColumns, currentColumns);

    return sortIsDirty || filtersAreDirty || columnsAreDirty;
  }, [savedConfiguration, searchParams, baselineColumns, currentColumns]);
