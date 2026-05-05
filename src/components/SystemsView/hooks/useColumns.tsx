import { DataViewTh } from '@patternfly/react-data-view';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiHostGetHostListOrderByEnum as ApiOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import type { ColumnManagementModalColumn } from '../../ColumnManagementModal';
import DisplayName from '../../../routes/Systems/components/SystemsTable/components/columns/DisplayName';
import React from 'react';
import Workspace from '../../../routes/Systems/components/SystemsTable/components/columns/Workspace';
import LastSeen from '../../../routes/Systems/components/SystemsTable/components/columns/LastSeen';
import OperatingSystem from '../../../routes/Systems/components/SystemsTable/components/columns/OperatingSystem';
import { System } from './useSystemsQuery';
import type { onSort, SortBy, SortDirection } from '../SystemsView';
import Tags from '../Tags';
import { LastSeenColumnHeader } from '../../../Utilities/LastSeenColumnHeader';
import { getSystemsViewColumnMinWidthStyle } from '../utils/columnMinWidths';
import { STICKY_ACTIONS_HEADER_PROPS } from '../utils/stickyActionsColumn';
import { STICKY_NAME_HEADER_PROPS } from '../utils/stickyNameColumn';

export interface RenderableColumn extends ColumnManagementModalColumn {
  renderCell: (system: System) => React.ReactNode;
  sortBy?: ApiOrderByEnum;
}

const FALLBACK_SORT: { sortBy: SortBy; direction: SortDirection } = {
  sortBy: ApiOrderByEnum.DisplayName,
  direction: 'asc',
};

const INITIAL_COLUMNS: RenderableColumn[] = [
  {
    title: 'Name',
    key: 'name',
    isShownByDefault: true,
    isShown: true,
    isUntoggleable: true,
    sortBy: ApiOrderByEnum.DisplayName,
    renderCell: (system: System) => (
      <DisplayName
        key={`name-${system.id}`}
        id={system.id}
        props={{}}
        {...system}
      />
    ),
  },
  {
    title: 'Workspace',
    key: 'workspace',
    isShownByDefault: true,
    isShown: true,
    sortBy: ApiOrderByEnum.GroupName,
    renderCell: (system: System) => (
      <Workspace key={`workspace-${system.id}`} groups={system.groups} />
    ),
  },
  {
    title: 'Tags',
    key: 'tags',
    isShownByDefault: true,
    isShown: true,
    renderCell: (system: System) => (
      <Tags key={`tags-${system.id}`} system={system} />
    ),
  },
  {
    title: 'OS',
    key: 'os',
    isShownByDefault: true,
    isShown: true,
    sortBy: ApiOrderByEnum.OperatingSystem,
    renderCell: (system: System) => (
      <OperatingSystem
        key={`os-${system.id}`}
        system_profile={system.system_profile}
      />
    ),
  },
  {
    title: <LastSeenColumnHeader />,
    key: 'last_seen',
    isShownByDefault: true,
    isShown: true,
    sortBy: ApiOrderByEnum.LastCheckIn,
    renderCell: (system: System) => (
      <LastSeen
        key={`lastseen-${system.id}`}
        updated={system.last_check_in}
        culled_timestamp={system?.culled_timestamp}
        stale_warning_timestamp={system?.stale_warning_timestamp}
        stale_timestamp={system?.stale_timestamp}
        per_reporter_staleness={system?.per_reporter_staleness}
      />
    ),
  },
];

interface UseColumnParams {
  sortBy: SortBy;
  onSort: onSort;
  direction: SortDirection;
  isInventoryViewsEnabled: boolean;
}

export const useColumns = ({
  sortBy,
  onSort,
  direction,
  isInventoryViewsEnabled,
}: UseColumnParams) => {
  const [columns, setColumns] = useState<RenderableColumn[]>(INITIAL_COLUMNS);

  const fromSortByToIndex = useCallback(
    (sortBy?: ApiOrderByEnum) =>
      columns
        .filter((col) => col.isShown)
        .findIndex((col) => col.sortBy === sortBy),
    [columns],
  );

  const tableHeaderNodes: DataViewTh[] = useMemo(
    () => [
      ...columns
        .filter((col) => col.isShown)
        .map((col, index) => {
          return {
            cell: col.title,
            props: {
              ...(col.key === 'name'
                ? isInventoryViewsEnabled
                  ? STICKY_NAME_HEADER_PROPS
                  : {}
                : isInventoryViewsEnabled
                  ? (getSystemsViewColumnMinWidthStyle(col.key) ?? {})
                  : {}),
              ...(col.sortBy && {
                sort: {
                  sortBy: { index: fromSortByToIndex(sortBy), direction },
                  onSort: (
                    _event:
                      | React.MouseEvent
                      | React.KeyboardEvent
                      | MouseEvent
                      | undefined,
                    _columnIndex: number,
                    newDirection: SortDirection,
                  ) => {
                    onSort(undefined, col.sortBy!, newDirection);
                  },
                  columnIndex: index,
                },
              }),
            },
          };
        }),
      {
        cell: '',
        props: isInventoryViewsEnabled
          ? STICKY_ACTIONS_HEADER_PROPS
          : { screenReaderText: 'Actions' },
      },
    ],
    [
      columns,
      fromSortByToIndex,
      sortBy,
      direction,
      onSort,
      isInventoryViewsEnabled,
    ],
  );

  useEffect(() => {
    if (sortBy) {
      const isSortColumnVisible = columns.some(
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
    tableHeaderNodes,
  };
};
