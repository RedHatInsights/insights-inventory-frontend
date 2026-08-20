import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SystemsView from '../SystemsView/SystemsView';
import type { SortDirection } from '../SystemsView/SystemsView';
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
  ALL_SYSTEMS_CONFIGURATION,
  type ViewConfiguration,
} from '../../api/inventoryViewsApi';
import { createViewColumnSelector } from './createViewColumnSelector';
import { parseViewConfigFilters } from './utils/viewConfigFilters';

const filtersToSearchParams = (
  filters?: Partial<Record<string, string | string[]>>,
): URLSearchParams => {
  const params = new URLSearchParams();
  if (!filters) return params;
  for (const [key, value] of Object.entries(filters)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v) params.append(key, String(v));
      }
    } else if (typeof value === 'string' && value) {
      params.set(key, value);
    }
  }
  return params;
};

const InventoryViews = () => {
  const { isReady, defaultFilters } = useAnsibleWorkloadDefault();
  const [isViewSaveAsModalOpen, setIsViewSaveAsModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeViewId, setActiveViewId] = useState(ALL_SYSTEMS_VIEW_ID);
  const queryClient = useQueryClient();
  const isInventoryViewsPrivateEnabled = useInventoryViewsPrivateFeatureFlag();
  const {
    data: viewsData,
    fetchNextPage: fetchNextViewsPage,
    hasNextPage: hasNextViewsPage,
    isFetchingNextPage: isFetchingNextViewsPage,
  } = useViewsQuery();
  const viewsList = useMemo(
    () => viewsData?.pages.flatMap((page) => page.results) ?? [],
    [viewsData],
  );
  const activeView = useMemo(
    () => viewsList.find((v) => v.id === activeViewId),
    [viewsList, activeViewId],
  );

  const viewConfiguration =
    activeView?.configuration ?? ALL_SYSTEMS_CONFIGURATION;

  const columnSelector = useMemo(
    () => createViewColumnSelector(viewConfiguration)!,
    [viewConfiguration],
  );

  const initialSort = useMemo(() => {
    const sort = activeView?.configuration?.sort;
    if (!sort) return undefined;
    return {
      sortBy: sort.key,
      direction: (sort.direction ?? 'asc') as SortDirection,
    };
  }, [activeView?.configuration?.sort]);

  const initialFilters = useMemo(
    () => parseViewConfigFilters(activeView?.configuration?.filters),
    [activeView?.configuration?.filters],
  );

  const handleSelectView = useCallback(
    (viewId: string) => {
      setActiveViewId(viewId);
      const view = viewsList.find((v) => v.id === viewId);
      const filters = parseViewConfigFilters(view?.configuration?.filters);
      setSearchParams(filtersToSearchParams(filters), { replace: true });
    },
    [setSearchParams, viewsList],
  );

  const handleSaveAs = () => {
    setIsViewSaveAsModalOpen(true);
  };

  const handleSaveAsSuccess = async (viewId: string, viewName: string) => {
    setIsViewSaveAsModalOpen(false);
    await queryClient.refetchQueries({ queryKey: ['views'] });
    setActiveViewId(viewId);
  };

  const handleRename = () => {
    setIsRenameModalOpen(true);
  };

  const handleRenameSuccess = (viewId: string, viewName: string) => {
    setIsRenameModalOpen(false);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = (viewId: string) => {
    setIsDeleteModalOpen(false);
    if (viewId === activeViewId) {
      setActiveViewId(ALL_SYSTEMS_VIEW_ID);
      setSearchParams(new URLSearchParams(), { replace: true });
    }
  };

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
            isSystemView={activeView?.is_system_view ?? true}
            onSelectView={handleSelectView}
            onSaveAs={handleSaveAs}
            onRename={handleRename}
            onDelete={handleDelete}
            onFetchNextViewsPage={fetchNextViewsPage}
            hasNextViewsPage={hasNextViewsPage}
            isFetchingNextViewsPage={isFetchingNextViewsPage}
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
        key={activeViewId}
        columns={columnSelector}
        initialSort={initialSort}
        initialFilters={initialFilters}
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
