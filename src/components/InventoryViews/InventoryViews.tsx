import { useQueryClient } from '@tanstack/react-query';
import type { ApiHostViewsGetHostViewsParams } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
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
import { shouldWaitForFetchedView } from './shouldWaitForFetchedView';
import useInventoryViewsPrivateFeatureFlag from '../../Utilities/useInventoryViewsPrivateFeatureFlag';
import useInventoryViewsFiltersFeatureFlag from '../../Utilities/useInventoryViewsFiltersFeatureFlag';
import useTagKeyColumnsFeatureFlag from '../../Utilities/useTagKeyColumnsFeatureFlag';
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
import {
  normalizeViewColumns,
  preserveTagColumns,
} from './normalizeViewColumns';
import { createViewFilterSelector } from './createViewFilterSelector';
import { resolveDefaultViewId } from './resolveDefaultViewId';
import { resolveSystemViewId } from './resolveSystemViewId';
import { resolveViewIdAfterDelete } from './resolveViewIdAfterDelete';
import { selectLegacyInventoryColumns } from './selectLegacyInventoryColumns';
import { getInventoryViewsFilterSelector } from './selectInventoryViewsFilters';
import {
  ANSIBLE_WORKLOAD,
  selectAnsibleWorkload,
} from './stampAnsibleWorkloadDefault';
import {
  resolveColumnSelector,
  type ColumnSelector,
} from '../SystemsView/columns/resolveColumnSelector';
import { resolveFilterSelector } from '../SystemsView/filters/resolveFilterSelector';
import { defaultValuesFrom } from '../SystemsView/filters/defaultValuesFrom';
import { getInventoryViewsFilterSpecs } from './inventoryViewsFilterSpecs';
import { SORT_URL_PARAM, SORT_DIR_URL_PARAM } from '../SystemsView/constants';
import { INITIAL_SORT } from '../SystemsView/hooks/useColumns';
import type { Column } from '../SystemsView/columns/types';
import type { InventoryBindableItem } from '../SystemsView/columns/inventory/columnDefinitions';
import type { FilterSpec } from '../SystemsView/filters/types';
import {
  buildViewConfigFilters,
  parseViewConfigFilters,
  parseViewConfigLastSeenCustomRange,
} from './utils/viewConfigFilters';
import { normalizeViewColumns } from './utils/normalizeViewColumns';
import { useWysiwygExportConfig } from './hooks/useWysiwygExportConfig';
import { useViewDirtyState } from './hooks/useViewDirtyState';
import { useUpdateViewMutation } from './hooks/useUpdateViewMutation';
import { useSetDefaultViewMutation } from './hooks/useSetDefaultViewMutation';
import type {
  LastSeenCustomRange,
  SystemsViewFilterState,
} from '../SystemsView/types';

const filtersToSearchParams = (
  filters?: SystemsViewFilterState,
  allowedKeys?: ReadonlySet<string>,
): URLSearchParams => {
  const params = new URLSearchParams();
  if (!filters) return params;
  for (const [key, value] of Object.entries(filters)) {
    // A view saved with filters that are now hidden (feature flag off) must not
    // leak its values into the URL — there would be no control to clear them.
    if (allowedKeys && !allowedKeys.has(key)) continue;
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
  const key = searchParams.get(SORT_URL_PARAM);
  const direction = searchParams.get(SORT_DIR_URL_PARAM);

  if (key == null || (direction !== 'asc' && direction !== 'desc')) {
    return undefined;
  }

  return { key, direction };
};

const getFiltersFromSearchParams = (
  searchParams: URLSearchParams,
  filterSpecs: readonly FilterSpec[],
  lastSeenCustomRange?: LastSeenCustomRange,
): ViewConfiguration['filters'] | undefined => {
  const filters: SystemsViewFilterState = {};

  for (const spec of filterSpecs) {
    filters[spec.filterId] = Array.isArray(spec.defaultValue)
      ? searchParams.getAll(spec.filterId)
      : (searchParams.get(spec.filterId) ?? '');
  }

  return buildViewConfigFilters(filters, lastSeenCustomRange ?? undefined);
};

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
  const isAppDataFiltersEnabled = useInventoryViewsFiltersFeatureFlag();
  const isTagKeyColumnsEnabled = useTagKeyColumnsFeatureFlag();
  const [currentLastSeenCustomRange, setCurrentLastSeenCustomRange] = useState<
    LastSeenCustomRange | undefined
  >(undefined);

  // WYSIWYG export: serialize the live table state into a ViewConfiguration
  // and let the export service replay it across all pages. The SystemsView
  // export menu owns the toast lifecycle around the returned promise.
  const exportConfig = useWysiwygExportConfig<InventoryBindableItem>();

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

  const isAllSystemsAlias = urlViewId === ALL_SYSTEMS_VIEW_ID;
  const systemViewId = useMemo(
    () => resolveSystemViewId(viewsList),
    [viewsList],
  );

  const activeViewId = useMemo(() => {
    if (!viewsLoaded) return urlViewId ?? ALL_SYSTEMS_VIEW_ID;
    if (isAllSystemsAlias) return systemViewId ?? ALL_SYSTEMS_VIEW_ID;
    if (urlViewId && viewsList.some((v) => v.id === urlViewId))
      return urlViewId;
    if (urlViewId && hasNextViewsPage) return urlViewId;
    return defaultViewId;
  }, [
    viewsLoaded,
    urlViewId,
    isAllSystemsAlias,
    systemViewId,
    viewsList,
    hasNextViewsPage,
    defaultViewId,
  ]);

  const activeViewInList = viewsList.find((v) => v.id === activeViewId);
  const shouldFetchActiveView =
    !activeViewInList && activeViewId !== ALL_SYSTEMS_VIEW_ID;

  const {
    data: fetchedActiveView,
    isLoading: isFetchedViewLoading,
    isError: isFetchedViewError,
  } = useViewQuery(shouldFetchActiveView ? activeViewId : undefined);
  const activeView = activeViewInList ?? fetchedActiveView;
  const isResolvingActiveView = shouldWaitForFetchedView({
    shouldFetch: shouldFetchActiveView,
    isLoading: isFetchedViewLoading,
    isError: isFetchedViewError,
  });
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

    if (isAllSystemsAlias) {
      if (!systemViewId) return;
      const next = new URLSearchParams(searchParams);
      next.set(VIEW_ID_URL_PARAM, systemViewId);
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
    isAllSystemsAlias,
    systemViewId,
    viewsList,
    searchParams,
    defaultViewId,
    setSearchParams,
    hasNextViewsPage,
  ]);

  const savedColumnSelector = useMemo(
    () =>
      createViewColumnSelector(
        activeView?.configuration,
        isTagKeyColumnsEnabled,
      ),
    [activeView?.configuration, isTagKeyColumnsEnabled],
  );

  const columnSelector = useMemo(
    (): ColumnSelector<InventoryBindableItem> =>
      savedColumnSelector ?? selectLegacyInventoryColumns,
    [savedColumnSelector],
  );

  const filterSpecs = useMemo(
    () => getInventoryViewsFilterSpecs(isAppDataFiltersEnabled),
    [isAppDataFiltersEnabled],
  );

  const filterSelector = useMemo(() => {
    const baseSelector = getInventoryViewsFilterSelector(
      isAppDataFiltersEnabled,
    );
    const selector =
      createViewFilterSelector(activeView?.configuration, baseSelector) ??
      baseSelector;
    const selectorWithWorkloadDefault = selectAnsibleWorkload(selector);

    return isAnsibleBundle ? selectorWithWorkloadDefault : selector;
  }, [activeView?.configuration, isAnsibleBundle, isAppDataFiltersEnabled]);

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
  const filterParamKeySet = useMemo(
    () => new Set(filterParamKeys),
    [filterParamKeys],
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
      const params = filtersToSearchParams(filters, filterParamKeySet);
      params.set(VIEW_ID_URL_PARAM, viewId);
      if (isAnsibleBundle && !params.has('workloads')) {
        params.set('workloads', ANSIBLE_WORKLOAD);
      }
      setSearchParams(params, { replace: true });
    },
    [isAnsibleBundle, setSearchParams, viewsList, filterParamKeySet],
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
    const sort =
      getSortFromSearchParams(searchParams) || activeView?.configuration?.sort;
    const filters = getFiltersFromSearchParams(
      searchParams,
      filterSpecs,
      currentLastSeenCustomRange === undefined
        ? (initialLastSeenCustomRange ?? undefined)
        : currentLastSeenCustomRange,
    );

    const normalizedColumns = currentColumns
      ? normalizeViewColumns(currentColumns)
      : normalizeViewColumns(baselineColumns);
    const columns = isTagKeyColumnsEnabled
      ? normalizedColumns
      : preserveTagColumns(
          normalizedColumns,
          activeView?.configuration?.columns,
        );

    return {
      columns,
      ...(sort && { sort }),
      ...(filters && { filters }),
    };
  };

  if (isViewsPending || isResolvingActiveView) {
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
            <SystemsView<InventoryBindableItem, ApiHostViewsGetHostViewsParams>
              key={`${activeViewId}-${viewsLoaded}-${isTagKeyColumnsEnabled}`}
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
              exportConfig={exportConfig}
            />
          )}
        </Actions>
      )}
    </>
  );
};

export default InventoryViews;
