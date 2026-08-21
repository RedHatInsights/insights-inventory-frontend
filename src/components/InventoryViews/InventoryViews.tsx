/* eslint-disable prettier/prettier */
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useMemo, useRef, useState } from 'react';
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
import { selectLegacyInventoryColumns } from './selectLegacyInventoryColumns';
import { SORT_URL_PARAM, SORT_DIR_URL_PARAM } from '../SystemsView/constants';
import { INITIAL_SORT } from '../SystemsView/hooks/useColumns';
import type { Column } from '../SystemsView/columns/allColumnDefinitions';
import {
  buildViewConfigFilters,
  parseViewConfigFilters,
} from './utils/viewConfigFilters';
import {
  useViewDirtyState,
  FILTER_PARAM_KEYS,
} from './hooks/useViewDirtyState';
import { useUpdateViewMutation } from './hooks/useUpdateViewMutation';

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
  const updateView = useUpdateViewMutation();
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
  const activeView = viewsList.find((v) => v.id === activeViewId);
  const isSystemView = activeView?.is_system_view ?? true;
  const viewsLoaded = !!viewsData;

  const baselineColumnsRef = useRef<readonly Column[]>();
  const [currentColumns, setCurrentColumns] = useState<readonly Column[]>();

  const handleColumnsChange = useCallback((columns: readonly Column[]) => {
    if (!baselineColumnsRef.current) {
      baselineColumnsRef.current = columns;
    }
    setCurrentColumns(columns);
  }, []);

  // Synchronous render-time reset: useEffect would fire after child effects,
  // causing onColumnsChange to run before the baseline clears.
  const prevViewKeyRef = useRef(`${activeViewId}-${viewsLoaded}`);
  const viewKey = `${activeViewId}-${viewsLoaded}`;
  if (viewKey !== prevViewKeyRef.current) {
    prevViewKeyRef.current = viewKey;
    baselineColumnsRef.current = undefined;
  }

  const columnSelector = useMemo(
    () => createViewColumnSelector(activeView?.configuration),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute when view switches or views data loads
    [activeViewId, viewsLoaded],
  );

  const initialSort = useMemo(() => {
    const sort = activeView?.configuration?.sort;
    if (!sort) return undefined;
    return {
      sortBy: sort.key,
      direction: (sort.direction ?? 'asc') as SortDirection,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- derive from view config on switch or data load
  }, [activeViewId, viewsLoaded]);

  const initialFilters = useMemo(
    () => parseViewConfigFilters(activeView?.configuration?.filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- derive from view config on switch or data load
    [activeViewId, viewsLoaded],
  );

  const isViewDirty = useViewDirtyState({
    activeViewId,
    savedConfiguration: activeView?.configuration,
    searchParams,
    baselineColumns: baselineColumnsRef.current,
    currentColumns,
  });

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

  const handleSave = () => {
    if (!activeView) return;
    updateView.mutate(
      {
        id: activeView.id,
        data: { configuration: getCurrentConfiguration() },
      },
      {
        onSuccess: () => {
          baselineColumnsRef.current = currentColumns;
        },
      },
    );
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
    const columns = currentColumns
      ? normalizeViewColumns(currentColumns)
      : (activeView?.configuration?.columns ?? []);

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
            isSystemView={isSystemView}
            isViewDirty={isViewDirty}
            isOwner={activeView?.is_owner ?? false}
            onSelectView={handleSelectView}
            onSaveAs={handleSaveAs}
            onRename={handleRename}
            onDelete={handleDelete}
            onFetchNextViewsPage={fetchNextViewsPage}
            hasNextViewsPage={hasNextViewsPage}
            isFetchingNextViewsPage={isFetchingNextViewsPage}
            onSave={handleSave}
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
        key={`${activeViewId}-${viewsLoaded}`}
        columns={columnSelector ?? selectLegacyInventoryColumns}
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
