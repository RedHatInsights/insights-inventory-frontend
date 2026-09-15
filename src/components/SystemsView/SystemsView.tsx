import React, { useCallback, useEffect, useMemo } from 'react';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  DataView,
  useDataViewPagination,
  useDataViewSort,
} from '@patternfly/react-data-view';
import { DataViewTable } from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { useDataViewSelection } from '@patternfly/react-data-view/dist/dynamic/Hooks';
import {
  Button,
  PageSection,
  Pagination,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { DataViewToolbar } from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';
import { BulkSelect } from '../BulkSelect';
import { useHostIdsWithKessel } from '../../Utilities/hooks/useHostIdsWithKessel';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import SkeletonTable from '@patternfly/react-component-groups/dist/dynamic/SkeletonTable';
import NoEntitiesFound from '../InventoryTable/NoEntitiesFound';
import { SystemsViewFilters } from './filters/SystemsViewFilters';
import { INITIAL_SORT, useColumns } from './hooks/useColumns';
import { SetURLSearchParams, useSearchParams } from 'react-router-dom';
import { SystemActionModalsProvider } from './SystemActionModalsContext';
import { SystemsViewBulkActions } from './SystemsViewBulkActions';
import { useBulkSelect } from './hooks/useBulkSelect';
import {
  mapSystemsToRows,
  type SystemsViewTableRow,
} from './utils/mapSystemsToRows';
import './SystemsView.scss';
import { InnerScrollContainer } from '@patternfly/react-table';
import { ColumnManagementModalProvider } from './ColumnManagementModalContext';
import {
  DataViewFiltersProvider,
  useDataViewFiltersContext,
} from './DataViewFiltersContext';
import { useResetPage } from './hooks/useResetPage';
import { INITIAL_PAGE, NO_HEADER } from '../InventoryViews/constants';
import { PER_PAGE } from '../../constants';
import { useDebouncedFilters } from './filters/useDebouncedFilters';
import { normalizeLegacySortSearchParams } from './utils/normalizeLegacySortSearchParams';
import {
  EMPTY_SERVICES,
  SORT_DIR_URL_PARAM,
  SORT_URL_PARAM,
} from './constants';
import useInventoryViewsFeatureFlag from '../../Utilities/useInventoryViewsFeatureFlag';
import type { Column } from './columns/types';
import type { System } from '../InventoryViews/hostsQueryOptions';
import type {
  LastSeenCustomRange,
  SortDirection,
  SystemsViewFetchParams,
  SystemsViewItem,
  SystemsViewQueryData,
} from './types';
import { deriveActiveState } from './utils/deriveActiveState';
import {
  resolveColumnSelector,
  type ColumnSelector,
} from './columns/resolveColumnSelector';
import {
  resolveFilterSelector,
  type FilterSelector,
} from './filters/resolveFilterSelector';
import { buildFilterParams } from './filters/buildFilterParams';
import { hasActiveFilterChips } from './filters/defaultValuesFrom';
import type { BoundFilter } from './filters/types';
import useInventoryViewsColumnsRbacFeatureFlag from '../../Utilities/useInventoryViewsColumnsRbacFeatureFlag';

export type { SortDirection } from './types';
export type { SystemsViewItem, SystemsViewQueryData } from './types';
export type SystemsViewFetchData<
  TItem extends SystemsViewItem,
  TFilterParams = unknown,
> = (
  params: SystemsViewFetchParams<TFilterParams>,
) => Promise<SystemsViewQueryData<TItem>>;
export type OnSort = (
  _event: React.MouseEvent | React.KeyboardEvent | MouseEvent | undefined,
  newSortBy: string,
  newSortDirection: SortDirection,
) => void;
export type Pagination = ReturnType<typeof useDataViewPagination>;

export type SystemsViewProps<
  TItem extends SystemsViewItem,
  TFilterParams = unknown,
> = {
  /**
   * Unique & stable queryKey prefix (`'hosts'`, `'inventory-views'`). SystemsView keys the
   * inner query as `[queryKeyPrefix, fetchParams]` and invalidates by this prefix after mutations.
   */
  queryKeyPrefix: string;
  /**
   * Fetches the data for table. Receives table state for pagination, sorting, and
   * filtering, and should use those values to fetch from backend.
   */
  fetchData: SystemsViewFetchData<TItem, TFilterParams>;
  /**
   * Selects view's columns from the shared catalog. The returned bound columns are
   * what SystemsView uses. For optimal performance use a stable reference, not an
   * inline definition.
   */
  columns?: ColumnSelector<TItem>;
  /**
   * Selects view's filters from the shared catalog. The returned bound filters are
   * what SystemsView uses. For optimal performance use a stable reference, not an
   * inline definition.
   */
  filters?: FilterSelector<TFilterParams>;
  initialSort?: { sortBy: Column['sortBy']; direction: SortDirection };
  initialLastSeenCustomRange?: LastSeenCustomRange;
  onColumnsChange?: (columns: readonly Column<TItem>[]) => void;
  onLastSeenCustomRangeChange?: (range: LastSeenCustomRange) => void;
};

interface SystemsViewInnerProps<TItem extends SystemsViewItem, TFilterParams> {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  queryKeyPrefix: string;
  fetchData: SystemsViewFetchData<TItem, TFilterParams>;
  resolvedDefaultColumns: readonly Column<TItem>[];
  resolvedFilters: readonly BoundFilter<TFilterParams>[];
  initialSort?: { sortBy: Column['sortBy']; direction: SortDirection };
  onColumnsChange?: (columns: readonly Column<TItem>[]) => void;
  onLastSeenCustomRangeChange?: (range: LastSeenCustomRange) => void;
}

function SystemsViewInner<TItem extends SystemsViewItem, TFilterParams>({
  searchParams,
  setSearchParams,
  queryKeyPrefix,
  fetchData,
  resolvedDefaultColumns,
  resolvedFilters,
  initialSort,
  onColumnsChange,
  onLastSeenCustomRangeChange,
}: SystemsViewInnerProps<TItem, TFilterParams>) {
  const queryClient = useQueryClient();
  const {
    filters,
    clearAllFilters,
    filtersDifferFromDefaults,
    lastSeenCustomRange,
  } = useDataViewFiltersContext();

  const hasFilterChips = useMemo(
    () => hasActiveFilterChips(filters, resolvedFilters),
    [filters, resolvedFilters],
  );

  const resetFiltersButton = filtersDifferFromDefaults ? (
    <ToolbarItem>
      <Button
        ouiaId="systems-view-header-reset-filters"
        variant="link"
        onClick={clearAllFilters}
        isInline
      >
        Reset filters
      </Button>
    </ToolbarItem>
  ) : null;

  useEffect(() => {
    onLastSeenCustomRangeChange?.(lastSeenCustomRange);
  }, [lastSeenCustomRange, onLastSeenCustomRangeChange]);

  const pagination = useDataViewPagination({
    perPage: PER_PAGE,
    page: INITIAL_PAGE,
    perPageParam: 'per_page',
    searchParams,
    setSearchParams,
  });

  useResetPage(filters, setSearchParams, lastSeenCustomRange);

  const debouncedFilters = useDebouncedFilters(filters, resolvedFilters);

  const filterParams = useMemo(
    () =>
      buildFilterParams(resolvedFilters, debouncedFilters, {
        lastSeenCustomRange,
      }),
    [resolvedFilters, debouncedFilters, lastSeenCustomRange],
  );

  const selection = useDataViewSelection<SystemsViewTableRow<TItem>>({
    matchOption: (a, b) => a.id === b.id,
    initialSelected: [],
  });
  const { selected, setSelected } = selection;

  const sortSearchParams = useMemo(
    () =>
      normalizeLegacySortSearchParams(searchParams, {
        sortParam: SORT_URL_PARAM,
        directionParam: SORT_DIR_URL_PARAM,
      }),
    [searchParams],
  );

  const sort = useDataViewSort({
    initialSort: initialSort ?? INITIAL_SORT,
    defaultDirection: 'asc',
    searchParams: sortSearchParams,
    setSearchParams,
    sortByParam: SORT_URL_PARAM,
    directionParam: SORT_DIR_URL_PARAM,
  });

  const sortBy = sort?.sortBy as Column['sortBy'];
  const { direction, onSort } = sort;

  const fetchParams = useMemo(
    (): SystemsViewFetchParams<TFilterParams> => ({
      page: pagination.page,
      perPage: pagination.perPage,
      sortBy,
      direction,
      filterParams,
    }),
    [pagination.page, pagination.perPage, sortBy, direction, filterParams],
  );

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeyPrefix, fetchParams],
    queryFn: () => fetchData(fetchParams),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
  const rowsData = data?.results;
  const total = data?.total;
  const isInventoryViewsRbacEnabled = useInventoryViewsColumnsRbacFeatureFlag();
  const deniedServices = isInventoryViewsRbacEnabled
    ? (data?.deniedServices ?? EMPTY_SERVICES)
    : EMPTY_SERVICES;

  const onInvalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: [queryKeyPrefix] });
  }, [queryClient, queryKeyPrefix]);

  const activeState = deriveActiveState({
    data: rowsData,
    isLoading,
    isFetching,
    isError,
  });

  const isInventoryViewsEnabled = useInventoryViewsFeatureFlag();

  const { columns, annotatedDefaults, setColumns, tableHeaderNodes } =
    useColumns({
      defaultColumns: resolvedDefaultColumns,
      sortBy,
      onSort,
      direction,
      isInventoryViewsEnabled,
      deniedServices: deniedServices ?? [],
    });

  // Wrapper to call both setColumns and onColumnsChange when user applies columns in modal.
  // Note: ColumnManagementModal always calls this with direct column array, never with updater function.
  const handleApplyColumns = useCallback(
    (newColumns: React.SetStateAction<readonly Column<TItem>[]>) => {
      setColumns(newColumns);
      // Only notify parent when columns are directly provided (modal always does this)
      if (typeof newColumns !== 'function') {
        onColumnsChange?.(newColumns);
      }
    },
    [setColumns, onColumnsChange],
  );

  // FIXME remove type casting
  const { hostsWithPermissions } = useHostIdsWithKessel(
    rowsData as unknown as System[] | undefined,
  );

  const rows = mapSystemsToRows({
    // FIXME: useHostIdsWithKessel still returns SystemWithPermissions[]
    data: (hostsWithPermissions ?? rowsData) as TItem[] | undefined,
    columns,
    isInventoryViewsEnabled,
  });

  const selectedSystems = selected.map((row) => row.meta);

  const { isPageSelected, isPartiallySelected, onBulkSelect } = useBulkSelect({
    selection,
    rows,
    total,
  });

  const systemsTableClassName = [
    'ins-c-systems-view-table',
    isInventoryViewsEnabled && 'ins-c-systems-view-table--scroll-layout',
  ]
    .filter(Boolean)
    .join(' ');

  const systemsTable = (
    <DataViewTable
      aria-label="Systems table"
      variant="compact"
      ouiaId="systems-view-table"
      columns={tableHeaderNodes}
      className={systemsTableClassName}
      rows={rows}
      headStates={{
        loading: NO_HEADER,
        empty: NO_HEADER,
        error: NO_HEADER,
      }}
      bodyStates={{
        loading: (
          <SkeletonTable
            isSelectable
            rowsCount={pagination.perPage}
            columns={tableHeaderNodes}
          />
        ),
        empty: <NoEntitiesFound />,
        error: (
          <ErrorState
            ouiaId="error-state"
            titleText="Unable to load data"
            bodyText="There was an error retrieving data. Check your connection and reload the page."
          />
        ),
      }}
    />
  );

  return (
    <SystemActionModalsProvider
      onInvalidate={onInvalidate}
      onSelectionClear={() => setSelected([])}
    >
      <ColumnManagementModalProvider
        columns={columns}
        defaultColumns={annotatedDefaults}
        setColumns={handleApplyColumns}
      >
        <DataView selection={selection} activeState={activeState}>
          <PageSection hasBodyWrapper={false}>
            <DataViewToolbar
              className={
                !hasFilterChips && filtersDifferFromDefaults
                  ? 'ins-c-systems-view-toolbar ins-c-systems-view-toolbar--with-reset-row'
                  : 'ins-c-systems-view-toolbar'
              }
              ouiaId="systems-view-header"
              clearAllFilters={clearAllFilters}
              customLabelGroupContent={
                // Always pass a node so DataViewToolbar does not fall back to
                // "Clear filters", which would no-op at spec defaults.
                <>{hasFilterChips ? resetFiltersButton : null}</>
              }
              bulkSelect={
                <BulkSelect
                  pageCount={rows.length}
                  // canSelectAll disabled see JIRA: RHINENG-22312 for details
                  totalCount={total}
                  selectedCount={selected.length}
                  pagePartiallySelected={isPartiallySelected}
                  pageSelected={isPageSelected}
                  onSelect={onBulkSelect}
                />
              }
              filters={
                resolvedFilters.length > 0 ? <SystemsViewFilters /> : undefined
              }
              actions={
                <SystemsViewBulkActions
                  // FIXME remove type casting
                  selectedSystems={selectedSystems as unknown as System[]}
                  activeState={activeState}
                />
              }
              pagination={
                <Pagination isCompact itemCount={total} {...pagination} />
              }
            />
            {/* PF hides the chip row at 0 chips; this row matches that chip-row layout. */}
            {!hasFilterChips && resetFiltersButton ? (
              <Toolbar
                className="ins-c-systems-view-reset-filters-row"
                ouiaId="systems-view-header-reset-row"
              >
                <ToolbarContent>
                  <ToolbarGroup variant="action-group-inline">
                    {resetFiltersButton}
                  </ToolbarGroup>
                </ToolbarContent>
              </Toolbar>
            ) : null}
            {isInventoryViewsEnabled ? (
              <InnerScrollContainer className="ins-c-systems-view-table-scroll">
                {systemsTable}
              </InnerScrollContainer>
            ) : (
              systemsTable
            )}
            <DataViewToolbar
              ouiaId="systems-view-footer"
              pagination={<Pagination itemCount={total} {...pagination} />}
            />
          </PageSection>
        </DataView>
      </ColumnManagementModalProvider>
    </SystemActionModalsProvider>
  );
}

export function SystemsView<
  TItem extends SystemsViewItem,
  TFilterParams = unknown,
>({
  queryKeyPrefix,
  fetchData,
  columns,
  filters,
  initialSort,
  initialLastSeenCustomRange,
  onColumnsChange,
  onLastSeenCustomRangeChange,
}: SystemsViewProps<TItem, TFilterParams>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const resolvedDefaultColumns = useMemo(
    () => resolveColumnSelector(columns),
    [columns],
  );
  const resolvedFilters = useMemo(
    () => resolveFilterSelector(filters),
    [filters],
  );

  return (
    <DataViewFiltersProvider
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      resolvedFilters={resolvedFilters}
      initialLastSeenCustomRange={initialLastSeenCustomRange}
    >
      <SystemsViewInner
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        queryKeyPrefix={queryKeyPrefix}
        fetchData={fetchData}
        resolvedDefaultColumns={resolvedDefaultColumns}
        resolvedFilters={resolvedFilters}
        initialSort={initialSort}
        onColumnsChange={onColumnsChange}
        onLastSeenCustomRangeChange={onLastSeenCustomRangeChange}
      />
    </DataViewFiltersProvider>
  );
}

export default SystemsView;
