import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import SystemsView from '../SystemsView/SystemsView';
import {
  INVENTORY_VIEWS_QUERY_KEY,
  useInventoryViewsQuery,
} from './hooks/useInventoryViewsQuery';

const InventoryViews = () => {
  const queryClient = useQueryClient();

  return (
    <SystemsView
      useDataQuery={useInventoryViewsQuery}
      onInvalidate={() =>
        queryClient.invalidateQueries({ queryKey: [INVENTORY_VIEWS_QUERY_KEY] })
      }
    />
  );
};

export default InventoryViews;
