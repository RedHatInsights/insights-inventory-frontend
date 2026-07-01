import { useEffect, useRef, useState } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import type { Column } from '../columns/allColumnDefinitions';

const STORAGE_KEY_PREFIX = 'ui.systems-view.columns';

const getUserStorageKey = (accountNumber: string, username: string): string =>
  `${STORAGE_KEY_PREFIX}.${accountNumber}.${username}`;

type ColumnPref = {
  key: string;
  isShown: boolean;
};

const getColumnSnapshot = (columns: readonly Column[]): ColumnPref[] =>
  columns.map((column) => ({
    key: column.key,
    isShown: column.isShown ?? column.isShownByDefault,
  }));

const loadColumnPrefs = (storageKey: string): ColumnPref[] | null => {
  try {
    const raw = localStorage.getItem(storageKey);
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

const saveColumnPrefs = (
  storageKey: string,
  columns: readonly Column[],
): void => {
  try {
    localStorage.setItem(
      storageKey,
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
  const chrome = useChrome();
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const [columns, setColumns] = useState<readonly Column[]>(defaultColumns);
  const loadedStorageKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void chrome.auth
      .getUser()
      .then((user) => {
        if (cancelled) {
          return;
        }

        const accountNumber = user?.identity?.account_number;
        const username =
          user?.identity?.user?.username ?? user?.identity?.user?.email;

        if (!accountNumber || !username) {
          return;
        }

        const key = getUserStorageKey(String(accountNumber), String(username));

        if (loadedStorageKeyRef.current === key) {
          return;
        }

        loadedStorageKeyRef.current = key;
        setStorageKey(key);
        setColumns(mergeColumnPrefs(defaultColumns, loadColumnPrefs(key)));
      })
      .catch(() => {
        // Ignore unavailable user identity (e.g. chromeless mode).
      });

    return () => {
      cancelled = true;
    };
  }, [chrome, defaultColumns]);

  useEffect(() => {
    if (storageKey) {
      saveColumnPrefs(storageKey, columns);
    }
  }, [columns, storageKey]);

  return { columns, setColumns };
};
