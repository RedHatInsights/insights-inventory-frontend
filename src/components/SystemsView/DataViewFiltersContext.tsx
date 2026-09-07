import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDataViewFilters } from '@patternfly/react-data-view';
import type { InventoryFilters } from './filters/SystemsViewFilters';
import type { FilterSpec } from './filters/types';
import { emptyValuesFrom } from './filters/emptyValuesFrom';
import {
  normalizeLastSeenFilterValue,
  SYSTEMS_VIEW_WORKSPACE_FILTER_PARAM,
} from './constants';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
import { GENERAL_GROUPS_READ_PERMISSION } from '../../constants';
import { useUngroupedWorkspaceId } from '../../hooks/useUngroupedWorkspaceId';
import type { LastSeenCustomRange } from './types';

export type { LastSeenCustomRange } from './types';

export { INITIAL_INVENTORY_FILTERS } from './filters/inventory/filterDefinitions';

export interface DataViewFiltersContextValue {
  filters: InventoryFilters;
  resolvedFilters: readonly FilterSpec[];
  onSetFilters: (_: Partial<InventoryFilters>) => void;
  clearAllFilters: () => void;
  hasDefaultFilters: boolean;
  lastSeenCustomRange: LastSeenCustomRange;
  setLastSeenCustomRange: React.Dispatch<
    React.SetStateAction<LastSeenCustomRange>
  >;
  /** Kessel ungrouped workspace UUID when `/groups?group_type=ungrouped-hosts` returns it */
  ungroupedWorkspaceId: string | undefined;
}

const DataViewFiltersContext =
  createContext<DataViewFiltersContextValue | null>(null);

/** Exported for tests that need to wrap with a provider */
export { DataViewFiltersContext };

export const useDataViewFiltersContext = () => {
  const context = useContext(DataViewFiltersContext);
  if (!context) {
    throw new Error(
      'useDataViewFiltersContext must be used within DataViewFiltersProvider',
    );
  }
  return context;
};

type SearchParamsTuple = ReturnType<
  typeof import('react-router-dom').useSearchParams
>;

interface DataViewFiltersProviderProps {
  children: React.ReactNode;
  resolvedFilters: readonly FilterSpec[];
  searchParams: SearchParamsTuple[0];
  setSearchParams: SearchParamsTuple[1];
  defaultFilters?: Partial<InventoryFilters>;
  initialFilters?: Partial<InventoryFilters>;
  initialLastSeenCustomRange?: LastSeenCustomRange;
}

export const DataViewFiltersProvider = ({
  children,
  resolvedFilters,
  searchParams,
  setSearchParams,
  defaultFilters,
  initialFilters,
  initialLastSeenCustomRange,
}: DataViewFiltersProviderProps) => {
  const [lastSeenCustomRange, setLastSeenCustomRange] =
    useState<LastSeenCustomRange>(initialLastSeenCustomRange ?? null);

  const { hasAccess } = useConditionalRBAC(
    [GENERAL_GROUPS_READ_PERMISSION],
    true,
    false,
  );

  const hasWorkspaceFilter = resolvedFilters.some(
    (spec) => spec.filterId === SYSTEMS_VIEW_WORKSPACE_FILTER_PARAM,
  );
  const hasLastSeenFilter = resolvedFilters.some(
    (spec) => spec.filterId === 'last_seen',
  );

  const emptyFilters = useMemo(
    () => emptyValuesFrom(resolvedFilters) as InventoryFilters,
    [resolvedFilters],
  );

  const { data: ungroupedWorkspaceId } = useUngroupedWorkspaceId(
    hasAccess && hasWorkspaceFilter,
  );

  const { filters: rawFilters, onSetFilters } =
    useDataViewFilters<InventoryFilters>({
      initialFilters: { ...emptyFilters, ...initialFilters },
      searchParams,
      setSearchParams,
    });

  const filters = useMemo(
    () =>
      hasLastSeenFilter
        ? {
            ...rawFilters,
            last_seen: normalizeLastSeenFilterValue(rawFilters.last_seen),
          }
        : rawFilters,
    [hasLastSeenFilter, rawFilters],
  );

  useEffect(() => {
    if (normalizeLastSeenFilterValue(rawFilters.last_seen) !== 'custom') {
      setLastSeenCustomRange(null);
    }
  }, [rawFilters.last_seen]);

  useEffect(() => {
    if (!hasWorkspaceFilter || !ungroupedWorkspaceId) {
      return;
    }
    const ids = rawFilters.group_id;
    if (!ids?.includes('')) {
      return;
    }
    onSetFilters({
      group_id: ids.map((id) => (id === '' ? ungroupedWorkspaceId : id)),
    });
  }, [
    hasWorkspaceFilter,
    ungroupedWorkspaceId,
    rawFilters.group_id,
    onSetFilters,
  ]);

  const clearAllFilters = useCallback(() => {
    setLastSeenCustomRange(null);
    onSetFilters({ ...emptyFilters, ...defaultFilters });
  }, [defaultFilters, emptyFilters, onSetFilters]);

  const hasDefaultFilters = Boolean(defaultFilters);

  const value = useMemo(
    () => ({
      filters,
      resolvedFilters,
      onSetFilters,
      clearAllFilters,
      hasDefaultFilters,
      lastSeenCustomRange,
      setLastSeenCustomRange,
      ungroupedWorkspaceId,
    }),
    [
      filters,
      resolvedFilters,
      onSetFilters,
      clearAllFilters,
      hasDefaultFilters,
      lastSeenCustomRange,
      setLastSeenCustomRange,
      ungroupedWorkspaceId,
    ],
  );

  return (
    <DataViewFiltersContext.Provider value={value}>
      {children}
    </DataViewFiltersContext.Provider>
  );
};
