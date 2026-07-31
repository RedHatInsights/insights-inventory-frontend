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
import ViewRenameModal from './Modals/ViewRenameModal';
import type { ViewConfiguration } from '../../api/inventoryViewsApi';
import { selectLegacyInventoryColumns } from './selectLegacyInventoryColumns';

const STATIC_ACTIVE_VIEW_ID = 'view-production';

const InventoryViews = () => {
  const [isViewSaveAsModalOpen, setIsViewSaveAsModalOpen] = useState(false);
  const [viewToRename, setViewToRename] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const isInventoryViewsPrivateEnabled = useInventoryViewsPrivateFeatureFlag();
  const { data: viewsData } = useViewsQuery();
  const viewsList = viewsData?.results ?? [];
  const activeView = viewsList.find((v) => v.id === STATIC_ACTIVE_VIEW_ID);
  const isSystemView = activeView?.is_system_view ?? true;

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

  // Open Rename modal
  const handleRename = () => {
    // TODO: Replace STATIC_ACTIVE_VIEW_ID with dynamic view selection (RHINENG-28357)
    if (STATIC_ACTIVE_VIEW_ID && activeView?.name) {
      setViewToRename({ id: STATIC_ACTIVE_VIEW_ID, name: activeView.name });
    }
  };

  // Handle successful view rename
  const handleRenameSuccess = (viewId: string, viewName: string) => {
    console.log('View renamed successfully:', { viewId, viewName });
    setViewToRename(null);
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
          <ViewsToolbar
            viewsList={viewsList}
            isSystemView={isSystemView}
            onSaveAs={handleSaveAs}
            onRename={handleRename}
          />
          <ViewSaveAsModal
            isOpen={isViewSaveAsModalOpen}
            onClose={() => setIsViewSaveAsModalOpen(false)}
            currentConfiguration={getCurrentConfiguration()}
            viewsList={viewsList}
            onSuccess={handleSaveAsSuccess}
          />
          {viewToRename && (
            <ViewRenameModal
              isOpen={!!viewToRename}
              onClose={() => setViewToRename(null)}
              viewId={viewToRename.id}
              currentName={viewToRename.name}
              viewsList={viewsList}
              onSuccess={handleRenameSuccess}
            />
          )}
        </>
      )}
      <SystemsView
        columns={selectLegacyInventoryColumns}
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
