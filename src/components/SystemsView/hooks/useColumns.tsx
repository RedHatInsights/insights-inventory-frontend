import React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OnSort, SortDirection } from '../SystemsView';
import {
  getColumnMinWidthStyle,
  getNameColumnMinWidth,
} from '../utils/columnMinWidths';
import { STICKY_ACTIONS_HEADER_PROPS } from '../utils/stickyActionsColumn';
import { getStickyNameHeaderProps } from '../utils/stickyNameColumn';
import defaultColumns, { type Column } from '../columns/allColumnDefinitions';
import {
  mergeColumnsWithDraft,
  toStoredColumnPreferences,
  saveInventoryTableDraft,
} from '../utils/inventoryTableDraftStorage';
import { useHydrateDraftField } from './useHydrateDraftField';

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
  orgId?: string;
  isDraftReady?: boolean;
}

export const useColumns = ({
  sortBy,
  onSort,
  direction,
  isInventoryViewsEnabled,
  orgId,
  isDraftReady = true,
}: UseColumnParams) => {
  const [columns, setColumnsState] =
    useState<readonly Column[]>(defaultColumns);

  // Hydrate columns from draft storage on mount
  useHydrateDraftField(orgId, isDraftReady, 'columns', (draftColumns) => {
    if (draftColumns.length) {
      setColumnsState(mergeColumnsWithDraft(defaultColumns, draftColumns));
    }
  });

  const setColumns = useCallback(
    (value: React.SetStateAction<readonly Column[]>) => {
      setColumnsState((previousColumns) => {
        const nextColumns =
          typeof value === 'function' ? value(previousColumns) : value;

        if (orgId !== undefined) {
          saveInventoryTableDraft(orgId, {
            columns: toStoredColumnPreferences(nextColumns),
          });
        }

        return nextColumns;
      });
    },
    [orgId],
  );

  const fromSortByToIndex = useCallback(
    (sortBy?: Column['sortBy']) =>
      columns
        .filter((col) => col.isShown)
        .findIndex((col) => col.sortBy === sortBy),
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
  }, [sortBy, columns, onSort]);

  return {
    columns,
    setColumns,
    tableHeaderNodes,
  };
};
