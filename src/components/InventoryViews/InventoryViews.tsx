import { useQueryClient } from '@tanstack/react-query';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bullseye, Spinner } from '@patternfly/react-core';
import SystemsView from '../SystemsView/SystemsView';
import type { SortDirection } from '../SystemsView/SystemsView';
import { Actions } from './actions';
import {
  fetchInventoryViews,
  INVENTORY_VIEWS_QUERY_KEY,
} from './inventoryViewsQueryOptions';
import { useAnsibleWorkloadsSearchParam } from './hooks/useAnsibleWorkloadsSearchParam';
import { useViewsQuery } from './hooks/useViewsQuery';
import { useViewQuery } from './hooks/useViewQuery';
import useInventoryViewsPrivateFeatureFlag from '../../Utilities/useInventoryViewsPrivateFeatureFlag';
import ViewsToolbar from './ViewsToolbar/ViewsToolbar';
import ViewSaveAsModal from './Modals/ViewSaveAsModal';
import ViewRenameModal from './Modals/ViewRenameModal';
import ViewDeleteModal from './Modals/ViewDeleteModal';
import {
  ALL_SYSTEMS_VIEW_ID,
  VIEW_ID_URL_PARAM,
  type ViewConfiguration,
} from '../../api/inventoryViewsApi';
import { createViewColumnSelector } from './createViewColumnSelector';
import { createViewFilterSelector } from './createViewFilterSelector';
import { resolveDefaultViewId } from './resolveDefaultViewId';
import { resolveViewIdAfterDelete } from './resolveViewIdAfterDelete';
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
import { useSetDefaultViewMutation } from './hooks/useSetDefaultViewMutation';
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
  const queryClient = useQueryClient();
  const updateView = useUpdateViewMutation();
  const setDefaultView = useSetDefaultViewMutation();
  const isInventoryViewsPrivateEnabled = useInventoryViewsPrivateFeatureFlag();
  const [currentLastSeenCustomRange, setCurrentLastSeenCustomRange] = useState<
    LastSeenCustomRange | undefined
  >(undefined);

  const {
    data: viewsData,
    fetchNextPage: fetchNextViewsPage,
    hasNextPage: hasNextViewsPage,
    isFetchingNextPage: isFetchingNextViewsPage,
    isPending: isViewsPending,
  } = useViewsQuery();

  const viewsList = useMemo(
    () => viewsData?.pages.flatMap((page) => page.results) ?? [],
    [viewsData],
  );

  const backendDefaultViewId = viewsData?.pages[0]?.default_view_id;

  const defaultViewId = useMemo(
    () => resolveDefaultViewId(viewsList, backendDefaultViewId),
    [viewsList, backendDefaultViewId],
  );

  const viewsLoaded = !!viewsData;
  const urlViewId = searchParams.get(VIEW_ID_URL_PARAM);

  const activeViewId = useMemo(() => {
    if (!viewsLoaded) return urlViewId ?? ALL_SYSTEMS_VIEW_ID;
    if (urlViewId && viewsList.some((v) => v.id === urlViewId))
      return urlViewId;
    if (urlViewId && hasNextViewsPage) return urlViewId;
    return defaultViewId;
  }, [viewsLoaded, urlViewId, viewsList, hasNextViewsPage, defaultViewId]);

  const activeViewInList = viewsList.find((v) => v.id === activeViewId);

  const { data: fetchedActiveView } = useViewQuery(
    !activeViewInList && activeViewId !== ALL_SYSTEMS_VIEW_ID
      ? activeViewId
      : undefined,
  );
  const activeView = activeViewInList ?? fetchedActiveView;
  const isSystemView = activeView?.is_system_view ?? true;

  const isDefaultView = activeViewId === defaultViewId;

  useEffect(() => {
    if (!viewsLoaded) return;

    if (!urlViewId) {
      if (defaultViewId === ALL_SYSTEMS_VIEW_ID) return; // default not ready yet
      const next = new URLSearchParams(searchParams);
      next.set(VIEW_ID_URL_PARAM, defaultViewId);
      setSearchParams(next, { replace: true });
      return;
    }

    // Known view, or possibly on a later page: nothing to normalize.
    if (viewsList.some((v) => v.id === urlViewId) || hasNextViewsPage) return;

    // Stale view_id: fall back to the default view, keeping filters.
    const next = new URLSearchParams(searchParams);
    if (defaultViewId === ALL_SYSTEMS_VIEW_ID) {
      next.delete(VIEW_ID_URL_PARAM);
    } else {
      next.set(VIEW_ID_URL_PARAM, defaultViewId);
    }
    setSearchParams(next, { replace: true });
  }, [
    viewsLoaded,
    urlViewId,
    viewsList,
    searchParams,
    defaultViewId,
    setSearchParams,
    hasNextViewsPage,
  ]);

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

  const baselineColumns = useMemo(
    () => resolveColumnSelector(columnSelector ?? selectLegacyInventoryColumns),
    [columnSelector],
  );

  const [currentColumns, setCurrentColumns] =
    useState<readonly Column<InventoryBindableItem>[]>();

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
      const view = viewsList.find((v) => v.id === viewId);
      const filters = parseViewConfigFilters(view?.configuration?.filters);
      // Switching views starts from a clean slate: build fresh params from the
      // target view's saved filters, dropping any params applied to the old view.
      const params = filtersToSearchParams(filters);
      params.set(VIEW_ID_URL_PARAM, viewId);
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
    // The new view captured the current params, so keep them and point the URL
    // at the newly created view so a refresh restores it.
    const next = new URLSearchParams(searchParams);
    next.set(VIEW_ID_URL_PARAM, viewId);
    setSearchParams(next, { replace: true });
  };

  const handleRename = () => {
    setIsRenameModalOpen(true);
  };

  const handleRenameSuccess = (viewId: string, viewName: string) => {
    setIsRenameModalOpen(false);
  };

  const handleSetDefault = () => {
    if (!activeView || setDefaultView.isPending) return;
    setDefaultView.mutate(activeView.id);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = (viewId: string) => {
    setIsDeleteModalOpen(false);
    if (viewId !== activeViewId) return;

    const fallbackViewId = resolveViewIdAfterDelete(
      viewId,
      backendDefaultViewId,
      viewsList,
    );
    const next = new URLSearchParams();
    if (fallbackViewId) next.set(VIEW_ID_URL_PARAM, fallbackViewId);
    setSearchParams(next, { replace: true });
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

  if (isViewsPending) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  return (
    <>
      {isInventoryViewsPrivateEnabled && (
        <>
          <ViewsToolbar
            viewsList={viewsList}
            activeViewId={activeViewId}
            defaultViewId={defaultViewId}
            isSystemView={isSystemView}
            isViewDirty={isViewDirty}
            isSaving={updateView.isPending}
            isOwner={activeView?.is_owner ?? false}
            isDefaultView={isDefaultView}
            isSettingDefault={setDefaultView.isPending}
            onSelectView={handleSelectView}
            onSaveAs={handleSaveAs}
            onRename={handleRename}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
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
        <Actions<InventoryBindableItem>>
          {({ bulkActions, rowActions }) => (
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
              bulkActions={bulkActions}
              rowActions={rowActions}
            />
          )}
        </Actions>
      )}
    </>
  );
};

export default InventoryViews;
