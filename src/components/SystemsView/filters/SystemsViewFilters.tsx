import React from 'react';
import DataViewFilters from '@patternfly/react-data-view/dist/cjs/DataViewFilters';
import LastSeenFilterExtension from './inventory/components/LastSeenFilterExtension';
import useFeatureFlag from '../../../Utilities/useFeatureFlag';
import { useDataViewFiltersContext } from '../DataViewFiltersContext';
import { getFilterComponent } from './getFilterComponent';

export type { InventoryFilters } from './types';
export { isToolbarLabel } from './types';

export const SystemsViewFilters = () => {
  const { filters, onSetFilters, resolvedFilters } =
    useDataViewFiltersContext();
  const isHideRHCFilterFlagEnabled = useFeatureFlag('hbi.ui.hide_rhc_filter');
  const showLastSeenExtension = resolvedFilters.some(
    (spec) => spec.filterId === 'last_seen',
  );

  return (
    <>
      {/* DataViewFilters is passing filter values to children implicitly */}
      <DataViewFilters
        onChange={(_, values) => {
          onSetFilters(values);
        }}
        values={filters}
      >
        {resolvedFilters.map((spec) => {
          if (spec.filterId === 'rhcStatus' && isHideRHCFilterFlagEnabled) {
            return null;
          }

          return getFilterComponent(spec);
        })}
      </DataViewFilters>
      {showLastSeenExtension ? <LastSeenFilterExtension /> : null}
    </>
  );
};

export default SystemsViewFilters;
