import React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import type { OnSort, SortDirection } from '../SystemsView';
import {
  getColumnMinWidthStyle,
  getNameColumnMinWidth,
} from '../utils/columnMinWidths';
import { STICKY_ACTIONS_HEADER_PROPS } from '../utils/stickyActionsColumn';
import { getStickyNameHeaderProps } from '../utils/stickyNameColumn';
import defaultColumns, { type Column } from '../columns/allColumnDefinitions';
import { usePersistedColumns } from './usePersistedColumns';

export const INITIAL_SORT: {
  sortBy: Column['sortBy'];
  direction: SortDirection;
} = {
  sortBy: 'last_check_in',
  direction: 'desc',
};

const FALLBACK_SORT: {
  sortBy: Column['sortBy'];
  direction: SortDirection;
} = {
  sortBy: 'display_name',
  direction: 'asc',
};

interface UseColumnParams {
  sortBy: Column['sortBy'];
  onSort: OnSort;
  direction: SortDirection;
  isInventoryViewsEnabled: boolean;
  deniedServices: string[];
}

export const useColumns = ({
  sortBy,
  onSort,
  direction,
  isInventoryViewsEnabled,
  deniedServices,
}: UseColumnParams) => {
  const { columns: persistedColumns, setColumns } =
    usePersistedColumns(defaultColumns);

  const annotatePermissions = useCallback(
    (cols: readonly Column[]): readonly Column[] =>
      cols.map((col) => ({
        ...col,
        isPermissionLocked:
          col.appName !== 'inventory' && deniedServices.includes(col.appName),
      })),
    [deniedServices],
  );

  const columns: readonly Column[] = useMemo(
    () => annotatePermissions(persistedColumns),
    [persistedColumns, annotatePermissions],
  );

  const annotatedDefaults: readonly Column[] = useMemo(
    () => annotatePermissions(defaultColumns),
    [annotatePermissions],
  );

  const fromSortByToIndex = useCallback(
    (sortBy?: Column['sortBy']): number | undefined => {
      const index = columns
        .filter((col) => col.isShown)
        .findIndex((col) => col.sortBy === sortBy);
      // Return undefined (no active column) rather than -1 so PatternFly does not
      // receive an out-of-bounds index while the fallback useEffect fires.
      return index === -1 ? undefined : index;
    },
    [columns],
  );

  const tableHeaderNodes = useMemo(
    () => [
      ...columns
        .filter((col) => col.isShown)
        .map((col, index) => {
          return {
            cell: col.title,
            props: {
              ...(col.key === 'name'
                ? isInventoryViewsEnabled
                  ? getStickyNameHeaderProps(getNameColumnMinWidth(col))
                  : {}
                : isInventoryViewsEnabled
                  ? (getColumnMinWidthStyle(col) ?? {})
                  : {}),
              ...(col.sortBy &&
                !col.isPermissionLocked && {
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
        (col) =>
          col.sortBy === sortBy && col.isShown && !col.isPermissionLocked,
      );

      if (!isSortColumnVisible) {
        onSort(undefined, FALLBACK_SORT.sortBy!, FALLBACK_SORT.direction);
      }
    }
  }, [sortBy, columns, onSort]);

  return {
    columns,
    annotatedDefaults,
    setColumns,
    tableHeaderNodes,
  };
};
