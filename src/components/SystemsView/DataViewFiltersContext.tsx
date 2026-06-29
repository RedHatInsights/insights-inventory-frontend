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
import { normalizeLastSeenFilterValue } from './constants';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
import { GENERAL_GROUPS_READ_PERMISSION } from '../../constants';
import { useUngroupedWorkspaceId } from '../../hooks/useUngroupedWorkspaceId';
import { clearInventoryTableDraftFilters } from './utils/inventoryTableDraftStorage';
import { INITIAL_INVENTORY_FILTERS } from './inventoryFilterDefaults';
import { useHydrateDraftField } from './hooks/useHydrateDraftField';

export type LastSeenCustomRange = {
  start?: string;
  end?: string;
} | null;

export { INITIAL_INVENTORY_FILTERS };

export interface DataViewFiltersContextValue {
  filters: InventoryFilters;
  onSetFilters: (_: Partial<InventoryFilters>) => void;
  clearAllFilters: () => void;
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
  searchParams: SearchParamsTuple[0];
  setSearchParams: SearchParamsTuple[1];
  orgId?: string;
  isDraftReady?: boolean;
}

export const DataViewFiltersProvider = ({
  children,
  searchParams,
  setSearchParams,
  orgId,
  isDraftReady = true,
}: DataViewFiltersProviderProps) => {
  const [lastSeenCustomRange, setLastSeenCustomRange] =
    useState<LastSeenCustomRange>(null);

  const { hasAccess } = useConditionalRBAC(
    [GENERAL_GROUPS_READ_PERMISSION],
    true,
    false,
  );

  const { data: ungroupedWorkspaceId } = useUngroupedWorkspaceId(
    Boolean(hasAccess),
  );

  const {
    filters: rawFilters,
    onSetFilters,
    clearAllFilters: hookClearAll,
  } = useDataViewFilters<InventoryFilters>({
    initialFilters: INITIAL_INVENTORY_FILTERS,
    searchParams,
    setSearchParams,
  });

  const filters = useMemo(
    () => ({
      ...rawFilters,
      last_seen: normalizeLastSeenFilterValue(rawFilters.last_seen),
    }),
    [rawFilters],
  );

  useEffect(() => {
    if (normalizeLastSeenFilterValue(rawFilters.last_seen) !== 'custom') {
      setLastSeenCustomRange(null);
    }
  }, [rawFilters.last_seen]);

  // Hydrate lastSeenCustomRange from draft storage when user selects 'custom' filter
  useHydrateDraftField(
    orgId,
    isDraftReady,
    'lastSeenCustomRange',
    setLastSeenCustomRange,
    {
      shouldHydrate: () =>
        normalizeLastSeenFilterValue(rawFilters.last_seen) === 'custom',
      extraDeps: [rawFilters.last_seen],
    },
  );

  useEffect(() => {
    if (!ungroupedWorkspaceId) {
      return;
    }
    const ids = rawFilters.group_id;
    if (!ids?.includes('')) {
      return;
    }
    onSetFilters({
      group_id: ids.map((id) => (id === '' ? ungroupedWorkspaceId : id)),
    });
  }, [ungroupedWorkspaceId, rawFilters.group_id, onSetFilters]);

  const clearAllFilters = useCallback(() => {
    setLastSeenCustomRange(null);
    if (orgId !== undefined) {
      clearInventoryTableDraftFilters(orgId);
    }
    hookClearAll();
  }, [hookClearAll, orgId]);

  const value = useMemo(
    () => ({
      filters,
      onSetFilters,
      clearAllFilters,
      lastSeenCustomRange,
      setLastSeenCustomRange,
      ungroupedWorkspaceId,
    }),
    [
      filters,
      onSetFilters,
      clearAllFilters,
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
