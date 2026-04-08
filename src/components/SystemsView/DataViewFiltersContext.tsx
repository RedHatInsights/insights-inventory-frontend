import React, { createContext, useContext, useMemo } from 'react';
import { useDataViewFilters } from '@patternfly/react-data-view';
import type { InventoryFilters } from './filters/SystemsViewFilters';

export const INITIAL_INVENTORY_FILTERS: InventoryFilters = {
  hostname_or_id: '',
  status: [],
  source: [],
  rhcStatus: [],
  system_type: [],
  workspace: [],
  last_seen: undefined,
  tags: [],
  operating_system: [],
};

export interface DataViewFiltersContextValue {
  filters: InventoryFilters;
  onSetFilters: (_: Partial<InventoryFilters>) => void;
  clearAllFilters: () => void;
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
  const { filters, onSetFilters, clearAllFilters } =
    useDataViewFilters<InventoryFilters>({
      initialFilters: INITIAL_INVENTORY_FILTERS,
      searchParams,
      setSearchParams,
    });

  const value = useMemo(
    () => ({
      filters,
      onSetFilters,
      clearAllFilters,
    }),
    [filters, onSetFilters, clearAllFilters],
  );

  return (
    <DataViewFiltersContext.Provider value={value}>
      {children}
    </DataViewFiltersContext.Provider>
  );
};
