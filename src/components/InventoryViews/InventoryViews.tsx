import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SystemsView from '../SystemsView/SystemsView';
import type { SortDirection } from '../SystemsView/SystemsView';
import {
  fetchInventoryViews,
  INVENTORY_VIEWS_QUERY_KEY,
} from './inventoryViewsQueryOptions';
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
import { SORT_URL_PARAM, SORT_DIR_URL_PARAM } from '../SystemsView/constants';
import { INITIAL_SORT } from '../SystemsView/hooks/useColumns';
import type { Column } from '../SystemsView/columns/allColumnDefinitions';
import {
  buildViewConfigFilters,
  parseViewConfigFilters,
} from './utils/viewConfigFilters';

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

const getSortFromSearchParams = (
  searchParams: URLSearchParams,
): ViewConfiguration['sort'] => {
  const key =
    searchParams.get(SORT_URL_PARAM) ?? INITIAL_SORT.sortBy ?? 'last_check_in';

  const direction =
    (searchParams.get(SORT_DIR_URL_PARAM) as 'asc' | 'desc') ??
    INITIAL_SORT.direction;

  return { key, direction };
};

const getFiltersFromSearchParams = (
  searchParams: URLSearchParams,
): ViewConfiguration['filters'] | undefined => {
  return buildViewConfigFilters({
    operating_system: searchParams.getAll('operating_system'),
    workloads: searchParams.getAll('workloads'),
    rhcStatus: searchParams.getAll('rhcStatus'),
    system_type: searchParams.getAll('system_type'),
  });
};

// TODO: Once backend accepts 'tags' column in view configuration API,
// update this function to not filter out columns without sortBy.
// Current issue: Tags column has no sortBy field and gets filtered out,
// so it cannot be saved to custom views. Backend currently rejects 'tags'
// as invalid column key (see validation error listing valid keys).
// Future fix: Change filter to use c.key instead of c.sortBy
const normalizeViewColumns = (
  columns: readonly Column[],
): ViewConfiguration['columns'] =>
  columns
    .filter(
      (c): c is Column & { sortBy: string } =>
        c.isShown === true && typeof c.sortBy === 'string',
    )
    .map((c) => ({ key: c.sortBy }));

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

  const [currentColumns, setCurrentColumns] =
    useState<ViewConfiguration['columns']>();

  const handleColumnsChange = useCallback((columns: readonly Column[]) => {
    setCurrentColumns(normalizeViewColumns(columns));
  }, []);

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

  const getCurrentConfiguration = (): ViewConfiguration => {
    const sort = getSortFromSearchParams(searchParams);
    const filters = getFiltersFromSearchParams(searchParams);
    const columns = currentColumns ?? activeView?.configuration?.columns ?? [];

    return {
      columns,
      sort,
      ...(filters && { filters }),
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
        onColumnsChange={handleColumnsChange}
        queryKeyPrefix={INVENTORY_VIEWS_QUERY_KEY}
        fetchData={fetchInventoryViews}
        defaultFilters={defaultFilters}
      />
    </>
  );
};

export default InventoryViews;
