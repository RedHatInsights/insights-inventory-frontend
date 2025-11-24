import React from 'react';
import {
  type DataViewState,
  DataView,
  DataViewTextFilter,
  useDataViewPagination,
} from '@patternfly/react-data-view';
import {
  DataViewTable,
  DataViewTh,
  DataViewTr,
} from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { useDataViewSelection } from '@patternfly/react-data-view/dist/dynamic/Hooks';
import { Pagination } from '@patternfly/react-core';
import DisplayName from '../../routes/Systems/components/SystemsTable/components/columns/DisplayName';
import Workspace from '../../routes/Systems/components/SystemsTable/components/columns/Workspace';
import Tags from '../../routes/Systems/components/SystemsTable/components/columns/Tags';
import OperatingSystem from '../../routes/Systems/components/SystemsTable/components/columns/OperatingSystem';
import LastSeen from '../../routes/Systems/components/SystemsTable/components/columns/LastSeen';
import { DataViewToolbar } from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';
import DataViewFilters from '@patternfly/react-data-view/dist/dynamic/DataViewFilters';
import {
  ResponsiveAction,
  ResponsiveActions,
  BulkSelect,
} from '@patternfly/react-component-groups';
import {
  type System,
  fetchAllSystems,
  useSystemsQuery,
} from './hooks/useSystemsQuery';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import SkeletonTable from '@patternfly/react-component-groups/dist/dynamic/SkeletonTable';
import { EmptySystemsState } from './components/EmptySystemsState';

const PER_PAGE = 50;
const INITIAL_PAGE = 1;
const NO_HEADER = <></>;

const SystemsViewTable: React.FC = () => {
  const queryClient = useQueryClient();

  const pagination = useDataViewPagination({
    perPage: PER_PAGE,
    page: INITIAL_PAGE,
  });

  const selection = useDataViewSelection({
    matchOption: (a, b) => a.id === b.id,
    initialSelected: [],
  });
  const { selected, onSelect, isSelected, setSelected } = selection;

  const { data, total, isLoading, isError, error } = useSystemsQuery({
    page: pagination.page,
    perPage: pagination.perPage,
  });

  type ActiveState = DataViewState | 'ready' | undefined;
  const getActiveState = (): ActiveState => {
    if (isLoading) {
      return 'loading';
    }
    if (isError) {
      return 'error';
    }
    if (data && data.length === 0) {
      return 'empty';
    }

    return 'ready';
  };

  const createRows = (data: System[]): DataViewTr[] => {
    return data.map((system) => ({
      id: system.id,
      // FIXME types in column components
      row: [
        <DisplayName
          key={`name-${system.id}`}
          id={system.id}
          props={{}}
          {...system}
        />,
        <Workspace key={`workspace-${system.id}`} groups={system.groups} />,
        <Tags
          key={`tags-${system.id}`}
          tags={system.tags}
          systemId={system.id}
        />,
        <OperatingSystem
          key={`os-${system.id}`}
          system_profile={system.system_profile}
        />,
        <LastSeen
          key={`lastseen-${system.id}`}
          updated={system.updated}
          culled_timestamp={system?.culled_timestamp}
          stale_warning_timestamp={system?.stale_warning_timestamp}
          stale_timestamp={system?.stale_timestamp}
          per_reporter_staleness={system?.per_reporter_staleness}
        />,
      ],
    }));
  };

  const rows = createRows(data ?? []);
  const columns: DataViewTh[] = [
    { cell: 'Name' },
    { cell: 'Workspace' },
    { cell: 'Tags' },
    { cell: 'OS' },
    {
      cell: 'Last Seen',
      props: { tooltip: 'Operating system' },
    },
  ];

  // TODO Define filters
  const filters = {};

  const onBulkSelect = async (value: string) => {
    switch (value) {
      case 'none':
      case 'nonePage':
        setSelected([]);
      case 'page':
        if (selected.length === 0) {
          onSelect(true, rows);
        } else {
          setSelected([]);
        }
        break;
      case 'all':
        const allSystems = await fetchAllSystems({
          total,
          perPage: pagination.perPage,
          queryClient,
        });
        onSelect(true, createRows(allSystems));
        break;
    }
  };

  return (
    <DataView selection={selection} activeState={getActiveState()}>
      <DataViewToolbar
        ouiaId="systems-view-header"
        clearAllFilters={() => {
          /* TODO implement clearAllFilters */
        }}
        bulkSelect={
          <BulkSelect
            pageCount={rows.length}
            // canSelectAll disabled as we miss spinner & ability to disable controls
            totalCount={total}
            selectedCount={selected.length}
            pagePartiallySelected={
              rows.some((row) => isSelected(row)) &&
              !rows.every((row) => isSelected(row))
            }
            pageSelected={rows.every((row) => isSelected(row))}
            onSelect={onBulkSelect}
          />
        }
        filters={
          <DataViewFilters
            onChange={() => {
              /* TODO implement onFilterChange */
            }}
            values={filters}
          >
            <DataViewTextFilter
              filterId="name"
              title="Name"
              placeholder="Filter by name"
            />
          </DataViewFilters>
        }
        actions={
          <ResponsiveActions ouiaId="systems-view-toolbar-actions">
            <ResponsiveAction>Action 1</ResponsiveAction>
            <ResponsiveAction>Action 2</ResponsiveAction>
          </ResponsiveActions>
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
              ouiaId="loading-systems-state"
              isSelectable
              rowsCount={pagination.perPage}
              columns={columns}
            />
          ),
          empty: <EmptySystemsState />,
          error: (
            <ErrorState
              ouiaId="error-systems-state"
              titleText="Unable to load data"
              bodyText={`There was an error retrieving data. ${error ? `${error.name} ${error.message}` : 'Check your connection and reload the page.'}`}
            />
          ),
        }}
      />
      <DataViewToolbar
        ouiaId="systems-view-footer"
        pagination={<Pagination isCompact itemCount={total} {...pagination} />}
      />
    </DataView>
  );
};

export default SystemsViewTable;
