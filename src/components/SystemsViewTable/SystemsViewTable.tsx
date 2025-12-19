import React from 'react';
import {
  DataView,
  DataViewTrObject,
  useDataViewFilters,
  useDataViewPagination,
} from '@patternfly/react-data-view';
import { DataViewTable } from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { useDataViewSelection } from '@patternfly/react-data-view/dist/dynamic/Hooks';
import { DataViewToolbar } from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';
import { BulkSelect } from '@patternfly/react-component-groups';
import { useSystemsQuery } from './hooks/useSystemsQuery';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import SkeletonTable from '@patternfly/react-component-groups/dist/dynamic/SkeletonTable';
import NoEntitiesFound from '../InventoryTable/NoEntitiesFound';
import { InventoryFilters, SystemsViewFilters } from './SystemsViewFilters';
import { useColumns } from './hooks/useColumns';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from '@patternfly/react-core';
import { useSystemsViewModals } from './hooks/useSystemsViewModals';
import { SystemsViewActions } from './SystemsViewActions';
import { useRowMapping } from './hooks/useRowMapping';
import { useBulkSelect } from './hooks/useBulkSelect';

export interface SystemsViewSelection {
  selected: DataViewTrObject[];
  setSelected: (items: DataViewTrObject[]) => void;
  onSelect: (isSelecting: boolean, items?: DataViewTrObject[]) => void;
  isSelected: (item: DataViewTrObject) => boolean;
}

const PER_PAGE = 50;
const INITIAL_PAGE = 1;
const NO_HEADER = <></>;

const SystemsViewTable: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    openDeleteModal,
    openAddToWorkspaceModal,
    openRemoveFromWorkspaceModal,
    openEditModal,
    modals,
  } = useSystemsViewModals(() => setSelected([]));

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

  const { columns, sortBy, direction } = useColumns();
  const { data, total, isLoading, isFetching, isError } = useSystemsQuery({
    page: pagination.page,
    perPage: pagination.perPage,
    filters,
    sortBy,
    direction,
  });

  const selectedIds = selected.map(({ id }) => id);
  const selectedSystems =
    data?.filter(({ id }) => id && selectedIds.includes(id)) || [];

  const activeState =
    isLoading || isFetching
      ? 'loading'
      : isError
        ? 'error'
        : data?.length === 0
          ? 'empty'
          : 'active';

  const mapSystemToRow = useRowMapping({
    openAddToWorkspaceModal,
    openRemoveFromWorkspaceModal,
    openEditModal,
    openDeleteModal,
  });

  const rows = (data ?? []).map(mapSystemToRow);

  const { isPageSelected, isPagePartiallySelected, onBulkSelect } =
    useBulkSelect({ selection, rows });

  return (
    <DataView selection={selection} activeState={activeState}>
      <DataViewToolbar
        ouiaId="systems-view-header"
        clearAllFilters={clearAllFilters}
        bulkSelect={
          <BulkSelect
            pageCount={rows.length}
            // canSelectAll disabled see JIRA: RHINENG-22312 for details
            totalCount={total}
            selectedCount={selected.length}
            pagePartiallySelected={isPagePartiallySelected}
            pageSelected={isPageSelected}
            onSelect={onBulkSelect}
          />
        }
        filters={
          <SystemsViewFilters filters={filters} onSetFilters={onSetFilters} />
        }
        actions={
          <SystemsViewActions
            selectedSystems={selectedSystems}
            activeState={activeState}
            openDeleteModal={openDeleteModal}
            openAddToWorkspaceModal={openAddToWorkspaceModal}
            openRemoveFromWorkspaceModal={openRemoveFromWorkspaceModal}
          />
        }
        pagination={<Pagination isCompact itemCount={total} {...pagination} />}
      />
      <DataViewTable
        aria-label="Systems table"
        variant="compact"
        ouiaId="systems-view-table"
        columns={columns}
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
              columns={columns}
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
      {modals}
    </DataView>
  );
};

export default SystemsViewTable;
