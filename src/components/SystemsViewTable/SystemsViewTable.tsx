import React from 'react';
import {
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
import { type System, useSystemsQuery } from './hooks/useSystemsQuery';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import SkeletonTable from '@patternfly/react-component-groups/dist/dynamic/SkeletonTable';
import { EmptySystemsState } from './components/EmptySystemsState';

const PER_PAGE = 50;
const INITIAL_PAGE = 1;
const NO_HEADER = <></>;

const SystemsViewTable: React.FC = () => {
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

  const activeState = isLoading
    ? 'loading'
    : isError
      ? 'error'
      : data?.length === 0
        ? 'empty'
        : 'active';

  const mapSystemToRow = (system: System): DataViewTr => {
    return {
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
    };
  };

  const rows = (data ?? []).map(mapSystemToRow);
  const columns: DataViewTh[] = [
    { cell: 'Name' },
    { cell: 'Workspace' },
    { cell: 'Tags' },
    { cell: 'OS', props: { tooltip: 'Operating system' } },
    { cell: 'Last Seen' },
  ];

  const isPageSelected = (rows: DataViewTr[]) =>
    rows.length > 0 && rows.every((row) => isSelected(row));

  const isPagePartiallySelected = (rows: DataViewTr[]) =>
    rows.some((row) => isSelected(row)) && !isPageSelected(rows);

  // TODO Define filters
  const filters = {};

  const onBulkSelect = async (value: string) => {
    switch (value) {
      case 'none':
      case 'nonePage':
        setSelected([]);
        break;
      case 'page':
        if (selected.length === 0) {
          onSelect(true, rows);
        } else {
          setSelected([]);
        }
        break;
    }
  };

  return (
    <DataView selection={selection} activeState={activeState}>
      <DataViewToolbar
        ouiaId="systems-view-header"
        clearAllFilters={() => {
          /* TODO implement clearAllFilters */
        }}
        bulkSelect={
          <BulkSelect
            pageCount={rows.length}
            // canSelectAll disabled see JIRA: RHINENG-22312 for details
            totalCount={total}
            selectedCount={selected.length}
            pagePartiallySelected={isPagePartiallySelected(rows)}
            pageSelected={isPageSelected(rows)}
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
              bodyText="There was an error retrieving data. Check your connection and reload the page."
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
