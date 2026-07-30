import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import SystemsView from '../SystemsView/SystemsView';
import { HOSTS_QUERY_KEY, useHostsQuery } from './hooks/useHostsQuery';
import { selectLegacyInventoryColumns } from './selectLegacyInventoryColumns';

const InventoryHosts = () => {
  const queryClient = useQueryClient();

  return (
    <SystemsView
      columns={selectLegacyInventoryColumns}
      useDataQuery={useHostsQuery}
      onInvalidate={() =>
        queryClient.invalidateQueries({ queryKey: [HOSTS_QUERY_KEY] })
      }
    />
  );
};

export default InventoryHosts;
