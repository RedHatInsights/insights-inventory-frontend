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

const STORAGE_KEY = 'ui.systems-view.columns';

type ColumnPref = {
  key: string;
  isShown: boolean;
};

const getColumnSnapshot = (columns: readonly Column[]): ColumnPref[] =>
  columns.map((column) => ({
    key: column.key,
    isShown: column.isShown ?? column.isShownByDefault,
  }));

const loadColumnPrefs = (): ColumnPref[] | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }

    const prefs = parsed.filter(
      (item): item is ColumnPref =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as ColumnPref).key === 'string' &&
        typeof (item as ColumnPref).isShown === 'boolean',
    );

    return prefs.length > 0 ? prefs : null;
  } catch {
    return null;
  }
};

const saveColumnPrefs = (columns: readonly Column[]): void => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(getColumnSnapshot(columns)),
    );
  } catch {
    // Ignore quota errors or storage unavailable (e.g. private browsing).
  }
};

const mergeColumnPrefs = (
  defaults: readonly Column[],
  stored: ColumnPref[] | null,
): readonly Column[] => {
  if (!stored) {
    return defaults;
  }

  const storedByKey = new Map(
    stored.map((pref, index) => [
      pref.key,
      { isShown: pref.isShown, order: index },
    ]),
  );

  const merged = defaults.map((column) => {
    const pref = storedByKey.get(column.key);
    if (pref) {
      return { ...column, isShown: pref.isShown };
    }

    return column;
  });

  return [...merged].sort((a, b) => {
    const aStored = storedByKey.get(a.key);
    const bStored = storedByKey.get(b.key);

    if (aStored && bStored) {
      return aStored.order - bStored.order;
    }

    if (aStored) {
      return -1;
    }

    if (bStored) {
      return 1;
    }

    return (
      defaults.findIndex((column) => column.key === a.key) -
      defaults.findIndex((column) => column.key === b.key)
    );
  });
};

interface UseColumnParams {
  sortBy: Column['sortBy'];
  onSort: OnSort;
  direction: SortDirection;
  isInventoryViewsEnabled: boolean;
}

export const useColumns = ({
  sortBy,
  onSort,
  direction,
  isInventoryViewsEnabled,
}: UseColumnParams) => {
  const [columns, setColumns] = useState<readonly Column[]>(() =>
    mergeColumnPrefs(defaultColumns, loadColumnPrefs()),
  );

  useEffect(() => {
    saveColumnPrefs(columns);
  }, [columns]);

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
