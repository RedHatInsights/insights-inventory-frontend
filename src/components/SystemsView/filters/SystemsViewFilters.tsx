import React from 'react';
import DataViewFilters from '@patternfly/react-data-view/dist/cjs/DataViewFilters';
import { useDataViewFiltersContext } from '../DataViewFiltersContext';
import useFeatureFlag from '../../../Utilities/useFeatureFlag';
import { getFilterComponent } from './getFilterComponent';
import LastSeenFilterExtension from './inventory/components/LastSeenFilterExtension';

export { isToolbarLabel } from './types';

export const SystemsViewFilters = () => {
  const { filters, onSetFilters, resolvedFilters } =
    useDataViewFiltersContext();
  const hideRhcFilter = Boolean(useFeatureFlag('hbi.ui.hide_rhc_filter'));
  const toolbarFilters = hideRhcFilter
    ? resolvedFilters.filter((spec) => spec.filterId !== 'rhcStatus')
    : resolvedFilters;

  return (
    <>
      {/* DataViewFilters is passing filter values to children implicitly */}
      <DataViewFilters
        onChange={(_, values) => {
          onSetFilters(values);
        }}
        values={filters}
      >
        {toolbarFilters.map(getFilterComponent)}
      </DataViewFilters>
      {toolbarFilters.some((spec) => spec.filterId === 'last_seen') && (
        <LastSeenFilterExtension />
      )}
    </>
  );
};

export default SystemsViewFilters;
