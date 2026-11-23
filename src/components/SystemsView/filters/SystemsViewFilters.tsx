import React from 'react';
import DataViewFilters from '@patternfly/react-data-view/dist/cjs/DataViewFilters';
import { useDataViewFiltersContext } from '../DataViewFiltersContext';
import { getFilterComponent } from './getFilterComponent';
import GroupedDataViewFilters from './GroupedDataViewFilters';
import { toDataViewFilterGroups } from './filterGroups';
import LastSeenFilterExtension from './inventory/components/LastSeenFilterExtension';

export { isToolbarLabel } from './types';

export interface SystemsViewFiltersProps {
  /**
   * Heads each service's filters with its app name in the attribute dropdown.
   * Off by default, which keeps PatternFly's own `DataViewFilters` — a view
   * binding one service's filters has nothing to disambiguate.
   */
  showFilterGroups?: boolean;
}

export const SystemsViewFilters = ({
  showFilterGroups = false,
}: SystemsViewFiltersProps) => {
  const { filters, onSetFilters, resolvedFilters } =
    useDataViewFiltersContext();

  // Both components pass filter values to children implicitly, and take the
  // same `onChange` / `values` contract, so the children are built once.
  const filterChildren = resolvedFilters.map(getFilterComponent);
  const onChange = (_key: string, values: Record<string, unknown>) => {
    onSetFilters(values);
  };

  return (
    <>
      {showFilterGroups ? (
        <GroupedDataViewFilters
          groups={toDataViewFilterGroups(resolvedFilters)}
          onChange={onChange}
          values={filters}
        >
          {filterChildren}
        </GroupedDataViewFilters>
      ) : (
        <DataViewFilters onChange={onChange} values={filters}>
          {filterChildren}
        </DataViewFilters>
      )}
      {resolvedFilters.some((spec) => spec.filterId === 'last_seen') && (
        <LastSeenFilterExtension />
      )}
    </>
  );
};

export default SystemsViewFilters;
