import { useQueryClient } from '@tanstack/react-query';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import SystemsView from '../SystemsView/SystemsView';
import type { SortDirection } from '../SystemsView/SystemsView';
import {
  fetchInventoryViews,
  INVENTORY_VIEWS_QUERY_KEY,
} from './inventoryViewsQueryOptions';
import { useAnsibleWorkloadsSearchParam } from './hooks/useAnsibleWorkloadsSearchParam';
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
import { createViewColumnSelector } from './createViewColumnSelector';
import { createViewFilterSelector } from './createViewFilterSelector';
import { selectLegacyInventoryColumns } from './selectLegacyInventoryColumns';
import { selectInventoryViewsFilters } from './selectInventoryViewsFilters';
import {
  ANSIBLE_WORKLOAD,
  selectAnsibleWorkload,
} from './stampAnsibleWorkloadDefault';
import { resolveColumnSelector } from '../SystemsView/columns/resolveColumnSelector';
import { resolveFilterSelector } from '../SystemsView/filters/resolveFilterSelector';
import { defaultValuesFrom } from '../SystemsView/filters/defaultValuesFrom';
import { SORT_URL_PARAM, SORT_DIR_URL_PARAM } from '../SystemsView/constants';
import { INITIAL_SORT } from '../SystemsView/hooks/useColumns';
import type { Column } from '../SystemsView/columns/types';
import type { InventoryBindableItem } from '../SystemsView/columns/inventory/columnDefinitions';
import {
  buildViewConfigFilters,
  parseViewConfigFilters,
  parseViewConfigLastSeenCustomRange,
} from './utils/viewConfigFilters';
import { useViewDirtyState } from './hooks/useViewDirtyState';
import { useUpdateViewMutation } from './hooks/useUpdateViewMutation';
import type {
  LastSeenCustomRange,
  SystemsViewFilterState,
} from '../SystemsView/types';

const filtersToSearchParams = (
  filters?: SystemsViewFilterState,
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
  lastSeenCustomRange?: LastSeenCustomRange,
): ViewConfiguration['filters'] | undefined => {
  return buildViewConfigFilters(
    {
      operating_system: searchParams.getAll('operating_system'),
      workloads: searchParams.getAll('workloads'),
      system_type: searchParams.getAll('system_type'),
      hostname_or_id: searchParams.get('hostname_or_id') || '',
      status: searchParams.getAll('status'),
      source: searchParams.getAll('source'),
      tags: searchParams.getAll('tags'),
      group_id: searchParams.getAll('group_id'),
      last_seen: searchParams.get('last_seen') || '',
    },
    lastSeenCustomRange ?? undefined,
  );
};

// Converts visible columns to ViewConfiguration format.
// Backend validates column keys server-side against its field registry.
const normalizeViewColumns = (
  columns: readonly Column<InventoryBindableItem>[],
): ViewConfiguration['columns'] =>
  columns
    .filter((c) => c.isShown === true && typeof c.key === 'string')
    .map((c) => ({ key: c.key }));

const InventoryViews = () => {
  const { isReady, isAnsibleBundle } = useAnsibleWorkloadsSearchParam();
  const [isViewSaveAsModalOpen, setIsViewSaveAsModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeViewId, setActiveViewId] = useState(ALL_SYSTEMS_VIEW_ID);
  const queryClient = useQueryClient();
  const updateView = useUpdateViewMutation();
  const isInventoryViewsPrivateEnabled = useInventoryViewsPrivateFeatureFlag();
  const [currentLastSeenCustomRange, setCurrentLastSeenCustomRange] = useState<
    LastSeenCustomRange | undefined
  >(undefined);
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
  const allSystemsViewId = useMemo(
    () => viewsList.find((v) => v.is_system_view)?.id ?? ALL_SYSTEMS_VIEW_ID,
    [viewsList],
  );

  useEffect(() => {
    if (
      activeViewId === ALL_SYSTEMS_VIEW_ID &&
      allSystemsViewId !== ALL_SYSTEMS_VIEW_ID
    ) {
      setActiveViewId(allSystemsViewId);
    }
  }, [activeViewId, allSystemsViewId]);

  const activeView = viewsList.find((v) => v.id === activeViewId);
  const isSystemView = activeView?.is_system_view ?? true;
  const viewsLoaded = !!viewsData;

  const columnSelector = useMemo(
    () => createViewColumnSelector(activeView?.configuration),
    [activeView?.configuration],
  );

  const filterSelector = useMemo(() => {
    const selector =
      createViewFilterSelector(activeView?.configuration) ??
      selectInventoryViewsFilters;
    const selectorWithWorkloadDefault = selectAnsibleWorkload(selector);

    return isAnsibleBundle ? selectorWithWorkloadDefault : selector;
  }, [activeView?.configuration, isAnsibleBundle]);

  const resolvedFilters = useMemo(
    () => resolveFilterSelector(filterSelector),
    [filterSelector],
  );
  const filterDefaultValues = useMemo(
    () => defaultValuesFrom(resolvedFilters),
    [resolvedFilters],
  );
  const filterParamKeys = useMemo(
    () => resolvedFilters.map((spec) => spec.filterId),
    [resolvedFilters],
  );

  // Baseline columns = the view's saved configuration, resolved to the same
  // Column[] shape the modal produces. Deriving it from the saved config (rather
  // than lazily seeding it from the first onColumnsChange) is what makes the
  // first edit count as dirty — otherwise the first edit becomes its own baseline.
  const baselineColumns = useMemo(
    () => resolveColumnSelector(columnSelector ?? selectLegacyInventoryColumns),
    [columnSelector],
  );

  // The user's live column edits from the Manage columns modal. `undefined` means
  // "no edits yet", so areColumnsDirty compares against the saved config baseline.
  const [currentColumns, setCurrentColumns] =
    useState<readonly Column<InventoryBindableItem>[]>();

  // Reset edits synchronously when the active view (or views data) changes so a
  // freshly selected view starts clean. Render-time reset avoids the one-frame
  // stale-dirty flash a useEffect would introduce.
  const prevViewKeyRef = useRef(`${activeViewId}-${viewsLoaded}`);
  const viewKey = `${activeViewId}-${viewsLoaded}`;
  if (viewKey !== prevViewKeyRef.current) {
    prevViewKeyRef.current = viewKey;
    setCurrentColumns(undefined);
    setCurrentLastSeenCustomRange(undefined);
  }

  const handleColumnsChange = useCallback(
    (columns: readonly Column<InventoryBindableItem>[]) => {
      setCurrentColumns(columns);
    },
    [],
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

  const initialLastSeenCustomRange = useMemo(
    () =>
      parseViewConfigLastSeenCustomRange(activeView?.configuration?.filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- derive from view config on switch or data load
    [activeViewId, viewsLoaded],
  );

  const isViewDirty = useViewDirtyState({
    activeViewId,
    savedConfiguration: activeView?.configuration,
    searchParams,
    baselineColumns,
    currentColumns,
    currentLastSeenCustomRange,
    defaultValues: filterDefaultValues,
    filterParamKeys,
  });

  const handleSelectView = useCallback(
    (viewId: string) => {
      setActiveViewId(viewId);
      const view = viewsList.find((v) => v.id === viewId);
      const filters = parseViewConfigFilters(view?.configuration?.filters);
      const params = filtersToSearchParams(filters);
      if (isAnsibleBundle && !params.has('workloads')) {
        params.set('workloads', ANSIBLE_WORKLOAD);
      }
      setSearchParams(params, { replace: true });
    },
    [isAnsibleBundle, setSearchParams, viewsList],
  );

  const handleSaveAs = () => {
    setIsViewSaveAsModalOpen(true);
  };

  const handleSave = () => {
    if (!activeView || updateView.isPending) return;
    updateView.mutate(
      {
        id: activeView.id,
        data: { configuration: getCurrentConfiguration() },
      },
      {
        onSuccess: () => {
          setCurrentColumns(undefined);
          setCurrentLastSeenCustomRange(undefined);
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
      setActiveViewId(allSystemsViewId);
      setSearchParams(new URLSearchParams(), { replace: true });
    }
  };

  const getCurrentConfiguration = (): ViewConfiguration => {
    const sort = getSortFromSearchParams(searchParams);
    const filters = getFiltersFromSearchParams(
      searchParams,
      currentLastSeenCustomRange === undefined
        ? (initialLastSeenCustomRange ?? undefined)
        : currentLastSeenCustomRange,
    );

    const columns = currentColumns
      ? normalizeViewColumns(currentColumns)
      : normalizeViewColumns(baselineColumns);

    return {
      columns,
      sort,
      ...(filters && { filters }),
    };
  };

  return (
    <>
      {isInventoryViewsPrivateEnabled && (
        <>
          <ViewsToolbar
            viewsList={viewsList}
            activeViewId={activeViewId}
            isSystemView={isSystemView}
            isViewDirty={isViewDirty}
            isSaving={updateView.isPending}
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
      {isReady && (
        <SystemsView
          key={`${activeViewId}-${viewsLoaded}`}
          columns={columnSelector ?? selectLegacyInventoryColumns}
          filters={filterSelector}
          initialSort={initialSort}
          initialLastSeenCustomRange={initialLastSeenCustomRange}
          onColumnsChange={handleColumnsChange}
          onLastSeenCustomRangeChange={setCurrentLastSeenCustomRange}
          queryKeyPrefix={INVENTORY_VIEWS_QUERY_KEY}
          fetchData={fetchInventoryViews}
        />
      )}
    </>
  );
};

export default InventoryViews;
