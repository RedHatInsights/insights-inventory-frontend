import React, { useCallback, useMemo } from 'react';
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
  ToolbarItem,
} from '@patternfly/react-core';
import { DataViewToolbar } from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';
import { BulkSelect } from '../BulkSelect';
import { useHostIdsWithKessel } from '../../Utilities/hooks/useHostIdsWithKessel';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import SkeletonTable from '@patternfly/react-component-groups/dist/dynamic/SkeletonTable';
import NoEntitiesFound from '../InventoryTable/NoEntitiesFound';
import {
  InventoryFilters,
  SystemsViewFilters,
} from './filters/SystemsViewFilters';
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
import { useDebouncedValue } from '../../Utilities/hooks/useDebouncedValue';
import { useResetPage } from './hooks/useResetPage';
import { INITIAL_PAGE, NO_HEADER } from '../InventoryViews/constants';
import { PER_PAGE } from '../../constants';
import { DEBOUNCE_TIMEOUT_MS } from '../../constants';
import { normalizeLegacySortSearchParams } from './utils/normalizeLegacySortSearchParams';
import {
  EMPTY_SERVICES,
  SORT_DIR_URL_PARAM,
  SORT_URL_PARAM,
} from './constants';
import useInventoryViewsFeatureFlag from '../../Utilities/useInventoryViewsFeatureFlag';
import type { Column } from './columns/allColumnDefinitions';
import type { System } from '../InventoryViews/hostsQueryOptions';
import type {
  SortDirection,
  SystemsViewFetchData,
  SystemsViewFetchParams,
  SystemsViewItem,
} from './types';
import { deriveActiveState } from './utils/deriveActiveState';
import {
  resolveColumnSelector,
  type ColumnSelector,
} from './columns/resolveColumnSelector';
import useInventoryViewsColumnsRbacFeatureFlag from '../../Utilities/useInventoryViewsColumnsRbacFeatureFlag';

export type { SortDirection } from './types';
export type {
  SystemsViewItem,
  SystemsViewQueryData,
  SystemsViewFetchData,
} from './types';
export type OnSort = (
  _event: React.MouseEvent | React.KeyboardEvent | MouseEvent | undefined,
  newSortBy: string,
  newSortDirection: SortDirection,
) => void;
export type Pagination = ReturnType<typeof useDataViewPagination>;

export type SystemsViewProps<TItem extends SystemsViewItem = SystemsViewItem> =
  {
    /**
     * Unique & stable queryKey prefix (`'hosts'`, `'inventory-views'`). SystemsView keys the
     * inner query as `[queryKeyPrefix, fetchParams]` and invalidates by this prefix after mutations.
     */
    queryKeyPrefix: string;
    /**
     * Fetches the data for table. Receives table state for pagination, sorting, and
     * filtering, and should use those values to fetch from backend.
     */
    fetchData: SystemsViewFetchData<TItem, InventoryFilters>;
    /**
     * Selects which columns are available in this view from the full catalog.
     * Stable reference for selectors required! don't define them inline in JSX.
     */
    columns?: ColumnSelector;
    defaultFilters?: Partial<InventoryFilters>;
    initialSort?: { sortBy: Column['sortBy']; direction: SortDirection };
    initialFilters?: Partial<InventoryFilters>;
    onColumnsChange?: (columns: readonly Column[]) => void;
  };

interface SystemsViewInnerProps<TItem extends SystemsViewItem> {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  queryKeyPrefix: string;
  fetchData: SystemsViewFetchData<TItem, InventoryFilters>;
  resolvedDefaultColumns: readonly Column[];
  initialSort?: { sortBy: Column['sortBy']; direction: SortDirection };
  onColumnsChange?: (columns: readonly Column[]) => void;
}

function SystemsViewInner<TItem extends SystemsViewItem>({
  searchParams,
  setSearchParams,
  queryKeyPrefix,
  fetchData,
  resolvedDefaultColumns,
  initialSort,
  onColumnsChange,
}: SystemsViewInnerProps<TItem>) {
  const queryClient = useQueryClient();
  const { filters, clearAllFilters, hasDefaultFilters, lastSeenCustomRange } =
    useDataViewFiltersContext();

  const pagination = useDataViewPagination({
    perPage: PER_PAGE,
    page: INITIAL_PAGE,
    perPageParam: 'per_page',
    searchParams,
    setSearchParams,
  });

  useResetPage(filters, setSearchParams, lastSeenCustomRange);

  const debouncedName = useDebouncedValue(
    filters.hostname_or_id,
    DEBOUNCE_TIMEOUT_MS,
  );
  const queryFilters: InventoryFilters = useMemo(
    () => ({
      ...filters,
      hostname_or_id: debouncedName,
    }),
    [filters, debouncedName],
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
    (): SystemsViewFetchParams<InventoryFilters> => ({
      page: pagination.page,
      perPage: pagination.perPage,
      filters: queryFilters,
      sortBy,
      direction,
      lastSeenCustomRange,
    }),
    [
      pagination.page,
      pagination.perPage,
      queryFilters,
      sortBy,
      direction,
      lastSeenCustomRange,
    ],
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
    (newColumns: React.SetStateAction<readonly Column[]>) => {
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

  // FIXME remove type casting
  const rows = mapSystemsToRows({
    data: (hostsWithPermissions ?? rowsData) as unknown as TItem[] | undefined,
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
              ouiaId="systems-view-header"
              clearAllFilters={clearAllFilters}
              customLabelGroupContent={
                hasDefaultFilters ? (
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
                ) : undefined
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
              filters={<SystemsViewFilters />}
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

export function SystemsView<TItem extends SystemsViewItem = SystemsViewItem>({
  queryKeyPrefix,
  fetchData,
  columns,
  defaultFilters,
  initialSort,
  initialFilters,
  onColumnsChange,
}: SystemsViewProps<TItem>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const resolvedDefaultColumns = useMemo(
    () => resolveColumnSelector(columns),
    [columns],
  );

  return (
    <DataViewFiltersProvider
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      defaultFilters={defaultFilters}
      initialFilters={initialFilters}
    >
      <SystemsViewInner
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        queryKeyPrefix={queryKeyPrefix}
        fetchData={fetchData}
        resolvedDefaultColumns={resolvedDefaultColumns}
        initialSort={initialSort}
        onColumnsChange={onColumnsChange}
      />
    </DataViewFiltersProvider>
  );
}

export default SystemsView;
