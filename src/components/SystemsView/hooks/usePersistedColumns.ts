import { useEffect, useState } from 'react';
import type { Column } from '../columns/allColumnDefinitions';

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
    // Ignore unavailable storage (e.g. private browsing).
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
      { isShown: pref.isShown, index: index },
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
      return aStored.index - bStored.index;
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

export const usePersistedColumns = (defaultColumns: readonly Column[]) => {
  const [columns, setColumns] = useState<readonly Column[]>(() =>
    mergeColumnPrefs(defaultColumns, loadColumnPrefs()),
  );

  useEffect(() => {
    saveColumnPrefs(columns);
  }, [columns]);

  return { columns, setColumns };
};
