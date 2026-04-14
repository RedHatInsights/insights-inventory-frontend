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

export type LastSeenCustomRange = {
  start?: string;
  end?: string;
} | null;

export const INITIAL_INVENTORY_FILTERS: InventoryFilters = {
  hostname_or_id: '',
  status: [],
  source: [],
  rhcStatus: [],
  system_type: [],
  group_name: [],
  last_seen: '',
  tags: [],
  operating_system: [],
  workloads: [],
};

export interface DataViewFiltersContextValue {
  filters: InventoryFilters;
  onSetFilters: (_: Partial<InventoryFilters>) => void;
  clearAllFilters: () => void;
  lastSeenCustomRange: LastSeenCustomRange;
  setLastSeenCustomRange: React.Dispatch<
    React.SetStateAction<LastSeenCustomRange>
  >;
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
}

export const DataViewFiltersProvider = ({
  children,
  searchParams,
  setSearchParams,
}: DataViewFiltersProviderProps) => {
  const [lastSeenCustomRange, setLastSeenCustomRange] =
    useState<LastSeenCustomRange>(null);

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

  const clearAllFilters = useCallback(() => {
    setLastSeenCustomRange(null);
    hookClearAll();
  }, [hookClearAll]);

  const value = useMemo(
    () => ({
      filters,
      onSetFilters,
      clearAllFilters,
      lastSeenCustomRange,
      setLastSeenCustomRange,
    }),
    [
      filters,
      onSetFilters,
      clearAllFilters,
      lastSeenCustomRange,
      setLastSeenCustomRange,
    ],
  );

  return (
    <DataViewFiltersContext.Provider value={value}>
      {children}
    </DataViewFiltersContext.Provider>
  );
};
