import React from 'react';
import DataViewFilters from '@patternfly/react-data-view/dist/cjs/DataViewFilters';
import { useDataViewFiltersContext } from '../DataViewFiltersContext';
import { getFilterComponent } from './getFilterComponent';
import LastSeenFilterExtension from './inventory/components/LastSeenFilterExtension';

export { isToolbarLabel } from './types';

export const SystemsViewFilters = () => {
  const { filters, onSetFilters, resolvedFilters } =
    useDataViewFiltersContext();

  return (
    <>
      {/* DataViewFilters is passing filter values to children implicitly */}
      <DataViewFilters
        onChange={(_, values) => {
          onSetFilters(values);
        }}
        values={filters}
      >
        {resolvedFilters.map(getFilterComponent)}
      </DataViewFilters>
      {resolvedFilters.some((spec) => spec.filterId === 'last_seen') && (
        <LastSeenFilterExtension />
      )}
    </>
  );
};

export default SystemsViewFilters;
