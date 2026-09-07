import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDataViewFilters } from '@patternfly/react-data-view';
import type { FilterSpec } from './filters/types';
import { emptyValuesFrom } from './filters/emptyValuesFrom';
import {
  normalizeLastSeenFilterValue,
  SYSTEMS_VIEW_WORKSPACE_FILTER_PARAM,
} from './constants';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
import { GENERAL_GROUPS_READ_PERMISSION } from '../../constants';
import { useUngroupedWorkspaceId } from '../../hooks/useUngroupedWorkspaceId';
import type { LastSeenCustomRange, SystemsViewFilterState } from './types';

export type { LastSeenCustomRange } from './types';

export { INITIAL_INVENTORY_FILTERS } from './filters/inventory/filterDefinitions';

export interface DataViewFiltersContextValue {
  filters: SystemsViewFilterState;
  resolvedFilters: readonly FilterSpec[];
  onSetFilters: (_: Partial<SystemsViewFilterState>) => void;
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
  defaultFilters?: Partial<SystemsViewFilterState>;
  initialFilters?: Partial<SystemsViewFilterState>;
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
    () => emptyValuesFrom(resolvedFilters),
    [resolvedFilters],
  );

  const { data: ungroupedWorkspaceId } = useUngroupedWorkspaceId(
    hasAccess && hasWorkspaceFilter,
  );

  const { filters: rawFilters, onSetFilters } =
    useDataViewFilters<SystemsViewFilterState>({
      initialFilters: { ...emptyFilters, ...initialFilters },
      searchParams,
      setSearchParams,
    });

  const workspaceFilterIds = rawFilters[SYSTEMS_VIEW_WORKSPACE_FILTER_PARAM];

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
    if (
      !Array.isArray(workspaceFilterIds) ||
      !workspaceFilterIds.includes('')
    ) {
      return;
    }
    onSetFilters({
      [SYSTEMS_VIEW_WORKSPACE_FILTER_PARAM]: workspaceFilterIds.map((id) =>
        id === '' ? ungroupedWorkspaceId : id,
      ),
    });
  }, [
    hasWorkspaceFilter,
    ungroupedWorkspaceId,
    workspaceFilterIds,
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
