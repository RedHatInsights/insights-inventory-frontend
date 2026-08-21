import React from 'react';
import SystemsView from '../SystemsView/SystemsView';
import { fetchHosts, HOSTS_QUERY_KEY } from './hostsQueryOptions';
import { useAnsibleWorkloadDefault } from './hooks/useAnsibleWorkloadDefault';
import { selectLegacyInventoryColumns } from './selectLegacyInventoryColumns';

const InventoryHosts = () => {
  const { isReady, defaultFilters } = useAnsibleWorkloadDefault();

  if (!isReady) {
    return null;
  }

  return (
    <SystemsView
      columns={selectLegacyInventoryColumns}
      queryKeyPrefix={HOSTS_QUERY_KEY}
      fetchData={fetchHosts}
      defaultFilters={defaultFilters}
    />
  );
};

export default InventoryHosts;
