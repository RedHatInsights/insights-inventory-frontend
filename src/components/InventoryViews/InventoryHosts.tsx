import React, { useMemo } from 'react';
import SystemsView from '../SystemsView/SystemsView';
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
    <SystemsView
      columns={selectLegacyInventoryColumns}
      filters={filtersSelector}
      queryKeyPrefix={HOSTS_QUERY_KEY}
      fetchData={fetchHosts}
    />
  );
};

export default InventoryHosts;
