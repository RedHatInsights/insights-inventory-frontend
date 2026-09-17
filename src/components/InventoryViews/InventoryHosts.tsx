import React, { useMemo } from 'react';
import type { InventoryBindableItem } from '../SystemsView/columns/inventory/columnDefinitions';
import SystemsView from '../SystemsView/SystemsView';
import { Actions } from './actions';
import { fetchHosts, HOSTS_QUERY_KEY } from './hostsQueryOptions';
import { useAnsibleWorkloadsSearchParam } from './hooks/useAnsibleWorkloadsSearchParam';
import { selectLegacyInventoryColumns } from './selectLegacyInventoryColumns';
import { selectLegacyInventoryFilters } from './selectLegacyInventoryFilters';
import { selectAnsibleWorkload } from './stampAnsibleWorkloadDefault';

const InventoryHosts = () => {
  const { isReady, isAnsibleBundle } = useAnsibleWorkloadsSearchParam();
  const filtersSelector = useMemo(
    () =>
      isAnsibleBundle
        ? selectAnsibleWorkload(selectLegacyInventoryFilters)
        : selectLegacyInventoryFilters,
    [isAnsibleBundle],
  );

  if (!isReady) {
    return null;
  }

  return (
    <Actions<InventoryBindableItem>>
      {({ bulkActions, rowActions }) => (
        <SystemsView
          columns={selectLegacyInventoryColumns}
          filters={filtersSelector}
          queryKeyPrefix={HOSTS_QUERY_KEY}
          fetchData={fetchHosts}
          bulkActions={bulkActions}
          rowActions={rowActions}
        />
      )}
    </Actions>
  );
};

export default InventoryHosts;
