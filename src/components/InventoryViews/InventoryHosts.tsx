import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import SystemsView from '../SystemsView/SystemsView';
import { HOSTS_QUERY_KEY, useHostsQuery } from './hooks/useHostsQuery';
import { useAnsibleWorkloadDefault } from './hooks/useAnsibleWorkloadDefault';
import { selectLegacyInventoryColumns } from './selectLegacyInventoryColumns';

const InventoryHosts = () => {
  const queryClient = useQueryClient();
  const { isReady, defaultFilters } = useAnsibleWorkloadDefault();

  if (!isReady) {
    return null;
  }

  return (
    <SystemsView
      columns={selectLegacyInventoryColumns}
      useDataQuery={useHostsQuery}
      defaultFilters={defaultFilters}
      onInvalidate={() =>
        queryClient.invalidateQueries({ queryKey: [HOSTS_QUERY_KEY] })
      }
    />
  );
};

export default InventoryHosts;
