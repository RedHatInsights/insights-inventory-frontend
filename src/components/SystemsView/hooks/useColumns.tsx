import { DataViewTh } from '@patternfly/react-data-view';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiHostGetHostListOrderByEnum as ApiOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import { ColumnManagementModalColumn } from '@patternfly/react-component-groups';
import DisplayName from '../../../routes/Systems/components/SystemsTable/components/columns/DisplayName';
import React from 'react';
import Workspace from '../../../routes/Systems/components/SystemsTable/components/columns/Workspace';
import LastSeen from '../../../routes/Systems/components/SystemsTable/components/columns/LastSeen';
import OperatingSystem from '../../../routes/Systems/components/SystemsTable/components/columns/OperatingSystem';
import Tags from '../../../routes/Systems/components/SystemsTable/components/columns/Tags';
import { System } from './useSystemsQuery';
import type { onSort, SortBy, SortDirection } from '../SystemsView';
import { DirectionsIcon } from '@patternfly/react-icons';

export interface Column extends ColumnManagementModalColumn {}
export interface RenderableColumn extends Column {
  renderCell: (system: System) => React.ReactNode;
  sortBy?: ApiOrderByEnum;
}

const FALLBACK_SORT: { sortBy: SortBy; direction: SortDirection } = {
  sortBy: ApiOrderByEnum.DisplayName,
  direction: 'asc',
};

const INITIAL_COLUMNS: Column[] = [
  {
    title: 'Name',
    key: 'name',
    isShownByDefault: true,
    isShown: true,
    isUntoggleable: true,
  },
  {
    title: 'Workspace',
    key: 'workspace',
    isShownByDefault: true,
    isShown: true,
  },
  {
    title: 'Tags',
    key: 'tags',
    isShownByDefault: true,
    isShown: true,
  },
  {
    title: 'OS',
    key: 'os',
    isShownByDefault: true,
    isShown: true,
  },
  {
    title: 'Last Seen',
    key: 'last_seen',
    isShownByDefault: true,
    isShown: true,
  },
];

const COLUMN_RENDER_CELLS: Record<string, (system: System) => React.ReactNode> =
  {
    name: (system: System) => (
      <DisplayName
        key={`name-${system.id}`}
        id={system.id}
        props={{}}
        {...system}
      />
    ),
    workspace: (system: System) => (
      <Workspace key={`workspace-${system.id}`} groups={system.groups} />
    ),
    tags: (system: System) => (
      <Tags key={`tags-${system.id}`} tags={system.tags} systemId={system.id} />
    ),
    os: (system: System) => (
      <OperatingSystem
        key={`os-${system.id}`}
        system_profile={system.system_profile}
      />
    ),
    last_seen: (system: System) => (
      <LastSeen
        key={`lastseen-${system.id}`}
        updated={system.last_check_in}
        culled_timestamp={system?.culled_timestamp}
        stale_warning_timestamp={system?.stale_warning_timestamp}
        stale_timestamp={system?.stale_timestamp}
        per_reporter_staleness={system?.per_reporter_staleness}
      />
    ),
  };

const COLUMN_SORT_BY: Record<string, ApiOrderByEnum | undefined> = {
  name: ApiOrderByEnum.DisplayName,
  workspace: ApiOrderByEnum.GroupName,
  tags: undefined,
  os: ApiOrderByEnum.OperatingSystem,
  last_seen: ApiOrderByEnum.LastCheckIn,
};

interface UseColumnParams {
  sortBy: SortBy;
  onSort: onSort;
  direction: SortDirection;
}

export const useColumns = ({ sortBy, onSort, direction }: UseColumnParams) => {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);

  const renderableColumns: RenderableColumn[] = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      renderCell: COLUMN_RENDER_CELLS[col.key] || (() => null),
      sortBy: COLUMN_SORT_BY[col.key],
    }));
  }, [columns]);

  const fromSortByToIndex = useCallback(
    (sortBy?: ApiOrderByEnum) =>
      renderableColumns
        .filter((col) => col.isShown)
        .findIndex((col) => col.sortBy === sortBy),
    [renderableColumns],
  );

  const tableHeaderNodes: DataViewTh[] = useMemo(
    () =>
      renderableColumns
        .filter((col) => col.isShown)
        .map((col, index) => {
          return {
            cell: col.title,
            props: {
              ...(col.sortBy && {
                sort: {
                  sortBy: { index: fromSortByToIndex(sortBy), direction },
                  onSort: (_, __, newDirection) => {
                    onSort(undefined, col.sortBy!, newDirection);
                  },
                  columnIndex: index,
                },
              }),
            },
          };
        }),
    [renderableColumns, fromSortByToIndex, sortBy, direction, onSort],
  );

  useEffect(() => {
    if (sortBy) {
      const isSortColumnVisible = renderableColumns.some(
        (col) => col.sortBy === sortBy && col.isShown,
      );

      if (!isSortColumnVisible) {
        onSort(undefined, FALLBACK_SORT.sortBy!, FALLBACK_SORT.direction);
      }
    }
  });

  return {
    columns,
    setColumns,
    renderableColumns,
    tableHeaderNodes,
  };
};
