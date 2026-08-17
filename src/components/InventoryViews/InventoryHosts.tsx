import React from 'react';
import SystemsView from '../SystemsView/SystemsView';
import { hostsQueryOptions } from './hostsQueryOptions';
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
      queryOptions={hostsQueryOptions}
      defaultFilters={defaultFilters}
    />
  );
};

export default InventoryHosts;
