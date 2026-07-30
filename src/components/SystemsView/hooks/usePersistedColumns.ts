import { useEffect, useRef, useState } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import useInventoryViewsFeatureFlag from '../../../Utilities/useInventoryViewsFeatureFlag';
import type { Column } from '../columns/allColumnDefinitions';

const STORAGE_KEY_PREFIX = 'ui.systems-view.columns';

const getUserStorageKey = (accountNumber: string, username: string): string =>
  `${STORAGE_KEY_PREFIX}.${accountNumber}.${username}`;

type ColumnPref = {
  key: string;
  isShown: boolean;
};

type PersistedColumnPrefs = {
  defaultsId: string;
  columns: ColumnPref[];
};

const getColumnSnapshot = (columns: readonly Column[]): ColumnPref[] =>
  columns.map((column) => ({
    key: column.key,
    isShown: column.isShown ?? column.isShownByDefault,
  }));

const getColumnKeySetId = (columns: readonly { key: string }[]): string =>
  columns
    .map((column) => column.key)
    .sort()
    .join(',');

const getColumnDefaultsId = (columns: readonly Column[]): string =>
  columns
    .map((column) => `${column.key}:${column.isShownByDefault}`)
    .sort()
    .join('|');

const parseColumnPrefs = (items: unknown[]): ColumnPref[] =>
  items.filter(
    (item): item is ColumnPref =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as ColumnPref).key === 'string' &&
      typeof (item as ColumnPref).isShown === 'boolean',
  );

const storedColumnKeysMatchDefaults = (
  stored: ColumnPref[],
  defaults: readonly Column[],
): boolean => getColumnKeySetId(stored) === getColumnKeySetId(defaults);

const removeColumnPrefs = (storageKey: string): void => {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Ignore unavailable storage (e.g. private browsing).
  }
};

const readPersistedColumnPrefs = (
  storageKey: string,
): PersistedColumnPrefs | ColumnPref[] | null => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      const columns = parseColumnPrefs(parsed);
      return columns.length > 0 ? columns : null;
    }

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as PersistedColumnPrefs).defaultsId === 'string' &&
      Array.isArray((parsed as PersistedColumnPrefs).columns)
    ) {
      const columns = parseColumnPrefs(
        (parsed as PersistedColumnPrefs).columns,
      );
      if (columns.length === 0) {
        return null;
      }

      return {
        defaultsId: (parsed as PersistedColumnPrefs).defaultsId,
        columns,
      };
    }

    return null;
  } catch {
    return null;
  }
};

const loadCompatibleColumnPrefs = (
  storageKey: string,
  defaults: readonly Column[],
): ColumnPref[] | null => {
  const stored = readPersistedColumnPrefs(storageKey);
  if (!stored) {
    return null;
  }

  const defaultsId = getColumnDefaultsId(defaults);
  const columns = Array.isArray(stored) ? stored : stored.columns;

  if (Array.isArray(stored)) {
    removeColumnPrefs(storageKey);
    return null;
  }

  if (!storedColumnKeysMatchDefaults(columns, defaults)) {
    removeColumnPrefs(storageKey);
    return null;
  }

  if (!Array.isArray(stored) && stored.defaultsId !== defaultsId) {
    removeColumnPrefs(storageKey);
    return null;
  }

  return columns;
};

const saveColumnPrefs = (
  storageKey: string,
  columns: readonly Column[],
  defaultsId: string,
): void => {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        defaultsId,
        columns: getColumnSnapshot(columns),
      } satisfies PersistedColumnPrefs),
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
  const shouldPersist = useInventoryViewsFeatureFlag();
  const chrome = useChrome();
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const [columns, setColumns] = useState<readonly Column[]>(defaultColumns);
  const loadedPrefsContextRef = useRef<{
    storageKey: string;
    defaultsId: string;
  } | null>(null);

  useEffect(() => {
    if (!shouldPersist) {
      loadedPrefsContextRef.current = null;
      setStorageKey(null);
      setColumns(defaultColumns);
      return;
    }

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
        const defaultsId = getColumnDefaultsId(defaultColumns);

        if (
          loadedPrefsContextRef.current?.storageKey === key &&
          loadedPrefsContextRef.current?.defaultsId === defaultsId
        ) {
          return;
        }

        loadedPrefsContextRef.current = { storageKey: key, defaultsId };
        setStorageKey(key);
        setColumns(
          mergeColumnPrefs(
            defaultColumns,
            loadCompatibleColumnPrefs(key, defaultColumns),
          ),
        );
      })
      .catch(() => {
        // Ignore unavailable user identity (e.g. chromeless mode).
      });

    return () => {
      cancelled = true;
    };
  }, [chrome, defaultColumns, shouldPersist]);

  useEffect(() => {
    if (!storageKey || !shouldPersist) {
      return;
    }

    const defaultsId = getColumnDefaultsId(defaultColumns);
    if (loadedPrefsContextRef.current?.defaultsId !== defaultsId) {
      return;
    }

    saveColumnPrefs(storageKey, columns, defaultsId);
  }, [columns, defaultColumns, storageKey, shouldPersist]);

  return { columns, setColumns };
};
