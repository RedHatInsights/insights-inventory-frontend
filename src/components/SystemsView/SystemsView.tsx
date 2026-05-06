import React, { useMemo } from 'react';
import {
  DataView,
  useDataViewPagination,
  useDataViewSort,
} from '@patternfly/react-data-view';
import { DataViewTable } from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { useDataViewSelection } from '@patternfly/react-data-view/dist/dynamic/Hooks';
import { PageSection, Pagination } from '@patternfly/react-core';
import { DataViewToolbar } from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';
import { BulkSelect } from '../BulkSelect';
import { useSystemsQuery } from './hooks/useSystemsQuery';
import { useHostIdsWithKessel } from '../../Utilities/hooks/useHostIdsWithKessel';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import SkeletonTable from '@patternfly/react-component-groups/dist/dynamic/SkeletonTable';
import NoEntitiesFound from '../InventoryTable/NoEntitiesFound';
import {
  InventoryFilters,
  SystemsViewFilters,
} from './filters/SystemsViewFilters';
import { useColumns } from './hooks/useColumns';
import { SetURLSearchParams, useSearchParams } from 'react-router-dom';
import { SystemActionModalsProvider } from './SystemActionModalsContext';
import { SystemsViewBulkActions } from './SystemsViewBulkActions';
import {
  useBulkSelect,
  type DataViewBulkSelection,
} from './hooks/useBulkSelect';
import { useRows, type SystemsViewTableRow } from './hooks/useRows';
import AccessDenied from '../../Utilities/AccessDenied';
import './SystemsView.scss';
import { ApiHostGetHostListOrderByEnum as ApiOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import { InnerScrollContainer, ISortBy } from '@patternfly/react-table';
import { ColumnManagementModalProvider } from './ColumnManagementModalContext';
import {
  DataViewFiltersProvider,
  useDataViewFiltersContext,
} from './DataViewFiltersContext';
import { useDebouncedValue } from '../../Utilities/hooks/useDebouncedValue';
import { useSearchParamsWithFragment } from './hooks/useSearchParamsWithFragment';
import { useResetPage } from './hooks/useResetPage';
import { INITIAL_PAGE, NO_HEADER } from '../InventoryViews/constants';
import { PER_PAGE } from '../../constants';
import { DEBOUNCE_TIMEOUT_MS } from '../../constants';
import { normalizeLegacySortSearchParams } from './utils/normalizeLegacySortSearchParams';
import { SORT_DIR_URL_PARAM, SORT_URL_PARAM } from './constants';
import useInventoryViewsFeatureFlag from '../../Utilities/useInventoryViewsFeatureFlag';

export type SortDirection = ISortBy['direction'];
export type SortBy = ApiOrderByEnum | undefined;
export type onSort = (
  _event: React.MouseEvent | React.KeyboardEvent | MouseEvent | undefined,
  newSortBy: string,
  newSortDirection: SortDirection,
) => void;
export type Pagination = ReturnType<typeof useDataViewPagination>;
interface SystemsViewInnerProps {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}

const SystemsViewInner = ({
  searchParams,
  setSearchParams,
}: SystemsViewInnerProps) => {
  const { filters, clearAllFilters, lastSeenCustomRange } =
    useDataViewFiltersContext();

  const pagination = useDataViewPagination({
    perPage: PER_PAGE,
    page: INITIAL_PAGE,
    perPageParam: 'per_page',
    searchParams,
    setSearchParams,
  });

  useResetPage(filters, pagination, lastSeenCustomRange);

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

  const selection = useDataViewSelection({
    matchOption: (a, b) => a.id === b.id,
    initialSelected: [],
  }) as DataViewBulkSelection<SystemsViewTableRow>;
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
    initialSort: {
      direction: 'desc',
      sortBy: ApiOrderByEnum.LastCheckIn,
    },
    defaultDirection: 'asc',
    searchParams: sortSearchParams,
    setSearchParams,
    sortByParam: SORT_URL_PARAM,
    directionParam: SORT_DIR_URL_PARAM,
  });

  const sortBy = sort?.sortBy as SortBy;
  const { direction, onSort } = sort;

  const isInventoryViewsEnabled = useInventoryViewsFeatureFlag();

  const { columns, setColumns, tableHeaderNodes } = useColumns({
    sortBy,
    onSort,
    direction,
    isInventoryViewsEnabled,
  });

  const { data, total, isLoading, isFetching, isError } = useSystemsQuery({
    page: pagination.page,
    perPage: pagination.perPage,
    filters: queryFilters,
    lastSeenCustomRange,
    sortBy,
    direction,
  });

  const { hostsWithPermissions } = useHostIdsWithKessel(data);

  const { rows } = useRows({
    data: hostsWithPermissions ?? data,
    columns,
    isInventoryViewsEnabled,
  });

  const selectedSystems = selected.map((row) => row.meta);

  const activeState =
    isLoading || isFetching
      ? 'loading'
      : isError
        ? 'error'
        : data?.length === 0
          ? 'empty'
          : 'active';

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
    <SystemActionModalsProvider onSelectionClear={() => setSelected([])}>
      <ColumnManagementModalProvider columns={columns} setColumns={setColumns}>
        <DataView selection={selection} activeState={activeState}>
          <PageSection hasBodyWrapper={false}>
            <DataViewToolbar
              ouiaId="systems-view-header"
              clearAllFilters={clearAllFilters}
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
                  selectedSystems={selectedSystems}
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
};

interface SystemsViewProps {
  hasAccess?: boolean;
}

export const SystemsView = ({ hasAccess = true }: SystemsViewProps) => {
  const [searchParams, setSearchParams] = useSearchParamsWithFragment();

  if (!hasAccess) {
    return (
      <AccessDenied
        title="This application requires Inventory permissions"
        description={
          <div>
            To view the content of this page, you must be granted a minimum of
            inventory permissions from your Organization Administrator.
          </div>
        }
        requiredPermission="inventory:*:read"
      />
    );
  }

  return (
    <DataViewFiltersProvider
      searchParams={searchParams}
      setSearchParams={setSearchParams}
    >
      <SystemsViewInner
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
    </DataViewFiltersProvider>
  );
};

export default SystemsView;
