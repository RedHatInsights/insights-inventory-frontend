import React, { useState } from 'react';
import {
  DataView,
  DataViewTrObject,
  useDataViewFilters,
  useDataViewPagination,
} from '@patternfly/react-data-view';
import { DataViewTable } from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { useDataViewSelection } from '@patternfly/react-data-view/dist/dynamic/Hooks';
import { Pagination } from '@patternfly/react-core';
import DisplayName from '../../routes/Systems/components/SystemsTable/components/columns/DisplayName';
import Workspace from '../../routes/Systems/components/SystemsTable/components/columns/Workspace';
import Tags from '../../routes/Systems/components/SystemsTable/components/columns/Tags';
import OperatingSystem from '../../routes/Systems/components/SystemsTable/components/columns/OperatingSystem';
import LastSeen from '../../routes/Systems/components/SystemsTable/components/columns/LastSeen';
import { DataViewToolbar } from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';
import {
  ResponsiveAction,
  ResponsiveActions,
  BulkSelect,
} from '@patternfly/react-component-groups';
import { type System, useSystemsQuery } from './hooks/useSystemsQuery';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import SkeletonTable from '@patternfly/react-component-groups/dist/dynamic/SkeletonTable';
import NoEntitiesFound from '../InventoryTable/NoEntitiesFound';
import { InventoryFilters, SystemsViewFilters } from './SystemsViewFilters';
import { useColumns } from './hooks/useColumns';
import { useSearchParams } from 'react-router-dom';
import DeleteModal from '../../Utilities/DeleteModal';
import { ActionsColumn } from '@patternfly/react-table';
import { useDeleteSystemsMutation } from './hooks/useDeleteSystemsMutation';

const PER_PAGE = 50;
const INITIAL_PAGE = 1;
const NO_HEADER = <></>;

const SystemsViewTable: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [systemsToDelete, setSystemsToDelete] = useState<System[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const pagination = useDataViewPagination({
    perPage: PER_PAGE,
    page: INITIAL_PAGE,
    searchParams,
    setSearchParams,
  });

  const selection = useDataViewSelection({
    matchOption: (a, b) => a.id === b.id,
    initialSelected: [],
  }) as {
    selected: DataViewTrObject[];
    setSelected: (items: DataViewTrObject[]) => void;
    onSelect: (isSelecting: boolean, items?: DataViewTrObject[]) => void;
    isSelected: (item: DataViewTrObject) => boolean;
  };

  const { selected, setSelected, onSelect, isSelected } = selection;

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

  const { onDeleteConfirm } = useDeleteSystemsMutation({
    systemsToDelete,
    onSuccess: () => {
      setSelected([]);
    },
    onMutate: () => {
      setIsDeleteModalOpen(false);
    },
  });

  const activeState =
    isLoading || isFetching
      ? 'loading'
      : isError
        ? 'error'
        : data?.length === 0
          ? 'empty'
          : 'active';

  const mapSystemToRow = (system: System): DataViewTrObject => {
    const rowActions = [
      {
        title: 'Add to workspace',
        onClick: () => {},
      },
      {
        title: 'Remove from workspace',
        onClick: () => {},
        isDisabled: true,
      },
      {
        title: 'Edit display name',
        onClick: () => {},
      },
      {
        title: 'Delete from inventory',
        onClick: () => {
          setSystemsToDelete([system]);
          setIsDeleteModalOpen(true);
        },
      },
    ];

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
        {
          cell: <ActionsColumn items={rowActions} />,
          props: { isActionCell: true },
        },
      ],
    };
  };

  const rows = (data ?? []).map(mapSystemToRow);

  const isPageSelected = (rows: DataViewTrObject[]) =>
    rows.length > 0 && rows.every((row) => isSelected(row));

  const isPagePartiallySelected = (rows: DataViewTrObject[]) =>
    rows.some((row) => isSelected(row)) && !isPageSelected(rows);

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
        clearAllFilters={clearAllFilters}
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
          <SystemsViewFilters filters={filters} onSetFilters={onSetFilters} />
        }
        actions={
          <ResponsiveActions ouiaId="systems-view-toolbar-actions">
            <ResponsiveAction
              isPersistent
              onClick={() => {
                setIsDeleteModalOpen(true);
                const selectedIds = selected.map(({ id }) => id);
                const systemsBulkSelected =
                  data?.filter(({ id }) => id && selectedIds.includes(id)) ||
                  [];
                setSystemsToDelete(systemsBulkSelected);
              }}
              isDisabled={activeState !== 'active' || selected.length === 0}
            >
              Delete
            </ResponsiveAction>
            <ResponsiveAction>Add to workspace</ResponsiveAction>
            <ResponsiveAction>Remove from workspace</ResponsiveAction>
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

      {isDeleteModalOpen && (
        <DeleteModal
          handleModalToggle={setIsDeleteModalOpen}
          isModalOpen={isDeleteModalOpen}
          currentSystems={systemsToDelete}
          onConfirm={onDeleteConfirm}
        />
      )}

      <DataViewToolbar
        ouiaId="systems-view-footer"
        pagination={<Pagination itemCount={total} {...pagination} />}
      />
    </DataView>
  );
};

export default SystemsViewTable;
