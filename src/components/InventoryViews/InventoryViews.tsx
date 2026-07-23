import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import SystemsView from '../SystemsView/SystemsView';
import {
  INVENTORY_VIEWS_QUERY_KEY,
  useInventoryViewsQuery,
} from './hooks/useInventoryViewsQuery';
import { useViewsQuery } from './hooks/useViewsQuery';
import useInventoryViewsPrivateFeatureFlag from '../../Utilities/useInventoryViewsPrivateFeatureFlag';
import ViewsToolbar from './ViewsToolbar/ViewsToolbar';
import ViewSaveAsModal from './Modals/ViewSaveAsModal';
import type { ViewConfiguration } from '../../api/inventoryViewsApi';

const InventoryViews = () => {
  const [isViewSaveAsModalOpen, setIsViewSaveAsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const isInventoryViewsPrivateEnabled = useInventoryViewsPrivateFeatureFlag();
  const { data: viewsData } = useViewsQuery();
  const viewsList = viewsData?.results ?? [];

  // Open Save As modal
  const handleSaveAs = () => {
    setIsViewSaveAsModalOpen(true);
  };

  // Handle successful view creation
  const handleSaveAsSuccess = (viewId: string, viewName: string) => {
    console.log('View created successfully:', { viewId, viewName });
    setIsViewSaveAsModalOpen(false);
    // TODO: Navigate to the new view or refresh view list
  };

  // Get current table configuration
  // TODO: Replace with actual table state when available
  const getCurrentConfiguration = (): ViewConfiguration => {
    return {
      columns: [],
      sort: { key: 'display_name', direction: 'asc' },
      filters: {},
    };
  };

  return (
    <>
      {isInventoryViewsPrivateEnabled && (
        <>
          <ViewsToolbar viewsList={viewsList} onSaveAs={handleSaveAs} />
          <ViewSaveAsModal
            isOpen={isViewSaveAsModalOpen}
            onClose={() => setIsViewSaveAsModalOpen(false)}
            currentConfiguration={getCurrentConfiguration()}
            viewsList={viewsList}
            onSuccess={handleSaveAsSuccess}
          />
        </>
      )}
      <SystemsView
        useDataQuery={useInventoryViewsQuery}
        onInvalidate={() =>
          queryClient.invalidateQueries({
            queryKey: [INVENTORY_VIEWS_QUERY_KEY],
          })
        }
      />
    </>
  );
};

export default InventoryViews;
