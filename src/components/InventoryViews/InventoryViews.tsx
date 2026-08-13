import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import SystemsView from '../SystemsView/SystemsView';
import {
  INVENTORY_VIEWS_QUERY_KEY,
  useInventoryViewsQuery,
} from './hooks/useInventoryViewsQuery';
import { useAnsibleWorkloadDefault } from './hooks/useAnsibleWorkloadDefault';
import { useViewsQuery } from './hooks/useViewsQuery';
import useInventoryViewsPrivateFeatureFlag from '../../Utilities/useInventoryViewsPrivateFeatureFlag';
import ViewsToolbar from './ViewsToolbar/ViewsToolbar';
import ViewSaveAsModal from './Modals/ViewSaveAsModal';
import ViewRenameModal from './Modals/ViewRenameModal';
import ViewDeleteModal from './Modals/ViewDeleteModal';
import {
  ALL_SYSTEMS_VIEW_ID,
  type ViewConfiguration,
} from '../../api/inventoryViewsApi';
import { selectLegacyInventoryColumns } from './selectLegacyInventoryColumns';

const InventoryViews = () => {
  const { isReady, defaultFilters } = useAnsibleWorkloadDefault();
  const [isViewSaveAsModalOpen, setIsViewSaveAsModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeViewId, setActiveViewId] = useState(ALL_SYSTEMS_VIEW_ID);
  const queryClient = useQueryClient();
  const isInventoryViewsPrivateEnabled = useInventoryViewsPrivateFeatureFlag();
  const { data: viewsData } = useViewsQuery();
  const viewsList = viewsData?.results ?? [];
  const activeView = viewsList.find((v) => v.id === activeViewId);
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

  const handleRename = () => {
    setIsRenameModalOpen(true);
  };

  const handleRenameSuccess = (viewId: string, viewName: string) => {
    console.log('View renamed successfully:', { viewId, viewName });
    setIsRenameModalOpen(false);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = (viewId: string) => {
    console.log('View deleted successfully:', { viewId });
    setIsDeleteModalOpen(false);
    // TODO: Switch to "All systems" default view if deleted view was active
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

  if (!isReady) {
    return null;
  }

  return (
    <>
      {isInventoryViewsPrivateEnabled && (
        <>
          <ViewsToolbar
            viewsList={viewsList}
            activeViewId={activeViewId}
            isSystemView={isSystemView}
            onSelectView={setActiveViewId}
            onSaveAs={handleSaveAs}
            onRename={handleRename}
            onDelete={handleDelete}
          />
          <ViewSaveAsModal
            isOpen={isViewSaveAsModalOpen}
            onClose={() => setIsViewSaveAsModalOpen(false)}
            currentConfiguration={getCurrentConfiguration()}
            viewsList={viewsList}
            onSuccess={handleSaveAsSuccess}
          />
          {activeView && (
            <ViewRenameModal
              isOpen={isRenameModalOpen}
              onClose={() => setIsRenameModalOpen(false)}
              viewId={activeView.id}
              currentName={activeView.name}
              viewsList={viewsList}
              onSuccess={handleRenameSuccess}
            />
          )}
          {activeView && (
            <ViewDeleteModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              viewId={activeView.id}
              viewName={activeView.name}
              onSuccess={handleDeleteSuccess}
            />
          )}
        </>
      )}
      <SystemsView
        columns={selectLegacyInventoryColumns}
        useDataQuery={useInventoryViewsQuery}
        defaultFilters={defaultFilters}
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
