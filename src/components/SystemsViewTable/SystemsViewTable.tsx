import React, { useState } from 'react';
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
import { Bullseye, Pagination, Spinner, Tooltip } from '@patternfly/react-core';
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
import { useSystemsQuery } from './hooks/useSystemsQuery';

const PER_PAGE = 50;
const INITIAL_PAGE = 1;

const SystemsViewTable: React.FC = () => {
  const pagination = useDataViewPagination({
    perPage: PER_PAGE,
    page: INITIAL_PAGE,
  });

  const selection = useDataViewSelection({
    matchOption: (a, b) => a.id === b.id,
  });

  const { data, total, isLoading } = useSystemsQuery({
    page: pagination.page,
    perPage: pagination.perPage,
  });

  if (isLoading || !data) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  const columns: DataViewTh[] = [
    'Name',
    'Workspace',
    'Tags',
    <Tooltip key="os-column" content={<span>Operating system</span>}>
      <span>OS</span>
    </Tooltip>,
    'Last seen',
  ];

  const rows: DataViewTr[] = data.map((system) => ({
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

  // TODO Define filters
  const filters = {};

  // TODO Define selected
  const selected = [];

  return (
    <DataView selection={selection} activeState={'ready'}>
      <DataViewToolbar
        ouiaId="LayoutExampleHeader"
        clearAllFilters={() => {
          /* TODO implement clearAllFilters */
        }}
        bulkSelect={
          <BulkSelect
            pageCount={rows.length}
            // totalCount={systems.length}
            selectedCount={selected.length}
            // pageSelected={rows.every((item) => isSelected(item))}
            // pagePartiallySelected={
            //   rows.some((item) => isSelected(item)) &&
            //   !rows.every((item) => isSelected(item))
            // }
            onSelect={() => {
              /** TODO implement onBulkSelect */
            }}
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
          <ResponsiveActions ouiaId="example-actions">
            <ResponsiveAction>Action 1</ResponsiveAction>
            <ResponsiveAction>Action 2</ResponsiveAction>
          </ResponsiveActions>
        }
        pagination={<Pagination isCompact itemCount={total} {...pagination} />}
      />
      <DataViewTable
        aria-label="Systems table"
        variant="compact"
        ouiaId="systems-dataview-table"
        columns={columns}
        rows={rows}
      />
      <DataViewToolbar
        ouiaId="LayoutExampleFooter"
        pagination={<Pagination isCompact itemCount={total} {...pagination} />}
      />
    </DataView>
  );
};

export default SystemsViewTable;
