import React, { useMemo } from 'react';
import {
  DataView,
  DataViewTrObject,
  useDataViewFilters,
  useDataViewPagination,
  useDataViewSort,
} from '@patternfly/react-data-view';
import { DataViewTable } from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { useDataViewSelection } from '@patternfly/react-data-view/dist/dynamic/Hooks';
import { PageSection, Pagination } from '@patternfly/react-core';
import { DataViewToolbar } from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';
import { BulkSelect } from '@patternfly/react-component-groups';
import { useSystemsQuery } from './hooks/useSystemsQuery';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import SkeletonTable from '@patternfly/react-component-groups/dist/dynamic/SkeletonTable';
import NoEntitiesFound from '../InventoryTable/NoEntitiesFound';
import {
  InventoryFilters,
  SystemsViewFilters,
} from './filters/SystemsViewFilters';
import { useColumns } from './hooks/useColumns';
import { useSearchParams } from 'react-router-dom';
import { SystemActionModalsProvider } from './SystemActionModalsContext';
import { SystemsViewBulkActions } from './SystemsViewBulkActions';
import { useBulkSelect } from './hooks/useBulkSelect';
import { useRows } from './hooks/useRows';
import AccessDenied from '../../Utilities/AccessDenied';
import { useHostIdsWithKessel } from '../../Utilities/hooks/useHostIdsWithKessel';
import './SystemsView.scss';
import { ApiHostGetHostListOrderByEnum as ApiOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import { ISortBy } from '@patternfly/react-table';
import { ColumnManagementModalProvider } from './ColumnManagementModalContext';
import { useDebouncedValue } from '../../Utilities/hooks/useDebouncedValue';
import { INITIAL_PAGE, NO_HEADER } from '../InventoryViews/constants';

export interface SystemsViewSelection {
  selected: DataViewTrObject[];
  setSelected: (items: DataViewTrObject[]) => void;
  onSelect: (isSelecting: boolean, items?: DataViewTrObject[]) => void;
  isSelected: (item: DataViewTrObject) => boolean;
}
export type SortDirection = ISortBy['direction'];
export type SortBy = ApiOrderByEnum | undefined;
export type onSort = (
  _event: React.MouseEvent | React.KeyboardEvent | MouseEvent | undefined,
  newSortBy: string,
  newSortDirection: SortDirection,
) => void;

const PER_PAGE = 50;
const DEBOUNCE_TIMEOUT_MS = 300;

interface SystemsViewProps {
  /** When false, shows the no-access state and does not fetch systems. Default true when not provided (e.g. when not wrapped by RenderWrapper). */
  hasAccess?: boolean;
}

const SystemsView = ({ hasAccess = true }: SystemsViewProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const pagination = useDataViewPagination({
    perPage: PER_PAGE,
    page: INITIAL_PAGE,
    searchParams,
    setSearchParams,
  });

  const selection = useDataViewSelection({
    matchOption: (a, b) => a.id === b.id,
    initialSelected: [],
  }) as SystemsViewSelection;
  const { selected, setSelected } = selection;

  const { filters, onSetFilters, clearAllFilters } =
    useDataViewFilters<InventoryFilters>({
      initialFilters: {
        name: '',
        status: [],
        dataCollector: [],
        rhcStatus: [],
        systemType: [],
        workspace: [],
      },
      searchParams,
      setSearchParams,
    });

  const debouncedName = useDebouncedValue(filters.name, DEBOUNCE_TIMEOUT_MS);
  const queryFilters: InventoryFilters = useMemo(() => {
    return {
      ...filters,
      name: debouncedName,
    };
  }, [filters, debouncedName]);

  const sort = useDataViewSort({
    initialSort: {
      direction: 'desc',
      sortBy: ApiOrderByEnum.LastCheckIn,
    },
    defaultDirection: 'asc',
    searchParams,
    setSearchParams,
    sortByParam: 'order_by',
    directionParam: 'order_how',
  });

  const sortBy = sort?.sortBy as SortBy;
  const { direction, onSort } = sort;

  const { columns, setColumns, renderableColumns, tableHeaderNodes } =
    useColumns({ sortBy, onSort, direction });

  const { data, total, isLoading, isFetching, isError } = useSystemsQuery({
    page: pagination.page,
    perPage: pagination.perPage,
    filters: queryFilters,
    sortBy,
    direction,
    enabled: hasAccess,
  });

  const { hostsWithPermissions } = useHostIdsWithKessel(data);
  const dataWithPermissions = hostsWithPermissions;

  const { rows } = useRows({
    data: dataWithPermissions,
    renderableColumns,
  });

  const selectedIds = selected.map(({ id }) => id);
  const selectedSystems =
    dataWithPermissions?.filter(({ id }) => id && selectedIds.includes(id)) ||
    [];

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
              filters={
                <SystemsViewFilters
                  filters={filters}
                  onSetFilters={onSetFilters}
                />
              }
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
            <DataViewTable
              aria-label="Systems table"
              variant="compact"
              ouiaId="systems-view-table"
              columns={tableHeaderNodes}
              className="ins-c-systems-view-table"
              rows={rows}
              headStates={{
                loading: NO_HEADER,
                empty: NO_HEADER,
                error: NO_HEADER,
              }}
              bodyStates={{
                loading: (
                  <SkeletonTable
                    ouiaId="loading-state"
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

export default SystemsView;
