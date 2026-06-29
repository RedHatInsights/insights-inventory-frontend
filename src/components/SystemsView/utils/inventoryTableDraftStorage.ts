import type { ISortBy } from '@patternfly/react-table';
import { INITIAL_INVENTORY_FILTERS } from '../inventoryFilterDefaults';
import type { LastSeenCustomRange } from '../DataViewFiltersContext';
import type { InventoryFilters } from '../filters/SystemsViewFilters';
import type { Column } from '../columns/allColumnDefinitions';
import { SORT_DIR_URL_PARAM, SORT_URL_PARAM } from '../constants';

export const INVENTORY_TABLE_DRAFT_VERSION = 1;

export const INVENTORY_TABLE_DRAFT_KEY_PREFIX =
  'insights.inventory.systems-view.draft';

export type StoredColumnPreference = {
  key: string;
  isShown: boolean;
};

export type InventoryTableDraft = {
  version: typeof INVENTORY_TABLE_DRAFT_VERSION;
  columns?: StoredColumnPreference[];
  filters?: InventoryFilters;
  lastSeenCustomRange?: LastSeenCustomRange;
  sort?: {
    sortBy: string;
    direction: ISortBy['direction'];
  };
  pagination?: {
    page: number;
    perPage: number;
  };
};

export const FILTER_PARAM_KEYS = Object.keys(
  INITIAL_INVENTORY_FILTERS,
) as (keyof InventoryFilters)[];

const TABLE_URL_PARAM_KEYS = [
  ...FILTER_PARAM_KEYS,
  SORT_URL_PARAM,
  SORT_DIR_URL_PARAM,
  'page',
  'per_page',
] as const;

export const getInventoryTableDraftStorageKey = (orgId: string) =>
  `${INVENTORY_TABLE_DRAFT_KEY_PREFIX}.${orgId}`;

export const getOrgIdFromChromeUser = (user: unknown): string | undefined => {
  const identity = (
    user as {
      identity?: {
        internal?: { org_id?: string };
        account_number?: string;
      };
    }
  )?.identity;

  return identity?.internal?.org_id ?? identity?.account_number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseStoredDraft = (raw: string): InventoryTableDraft | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== INVENTORY_TABLE_DRAFT_VERSION) {
      return null;
    }
    return parsed as InventoryTableDraft;
  } catch {
    return null;
  }
};

export const readInventoryTableDraft = (
  orgId: string,
): InventoryTableDraft | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(
    getInventoryTableDraftStorageKey(orgId),
  );
  if (!raw) {
    return null;
  }

  return parseStoredDraft(raw);
};

export const writeInventoryTableDraft = (
  orgId: string,
  draft: InventoryTableDraft,
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    getInventoryTableDraftStorageKey(orgId),
    JSON.stringify(draft),
  );
};

export const saveInventoryTableDraft = (
  orgId: string,
  partial: Partial<Omit<InventoryTableDraft, 'version'>>,
): void => {
  const existing = readInventoryTableDraft(orgId);

  writeInventoryTableDraft(orgId, {
    version: INVENTORY_TABLE_DRAFT_VERSION,
    ...existing,
    ...partial,
  });
};

export const clearInventoryTableDraftFilters = (orgId: string): void => {
  const existing = readInventoryTableDraft(orgId);
  if (!existing) {
    return;
  }

  writeInventoryTableDraft(orgId, {
    version: INVENTORY_TABLE_DRAFT_VERSION,
    columns: existing.columns,
    sort: existing.sort,
    pagination: existing.pagination,
    filters: { ...INITIAL_INVENTORY_FILTERS },
    lastSeenCustomRange: null,
  });
};

export const hasFilterOrSortInUrl = (
  searchParams: URLSearchParams,
): boolean => {
  for (const key of FILTER_PARAM_KEYS) {
    const initial = INITIAL_INVENTORY_FILTERS[key];
    if (Array.isArray(initial)) {
      if (searchParams.getAll(key).length > 0) {
        return true;
      }
      continue;
    }

    if (searchParams.get(key)) {
      return true;
    }
  }

  return searchParams.has(SORT_URL_PARAM);
};

export const hasPersistedTableState = (draft: InventoryTableDraft): boolean => {
  if (draft.columns?.length) {
    return true;
  }

  if (draft.sort?.sortBy) {
    return true;
  }

  if (draft.lastSeenCustomRange?.start || draft.lastSeenCustomRange?.end) {
    return true;
  }

  if (draft.filters) {
    for (const key of FILTER_PARAM_KEYS) {
      const initial = INITIAL_INVENTORY_FILTERS[key];
      const value = draft.filters[key];
      if (Array.isArray(initial)) {
        if (Array.isArray(value) && value.length > 0) {
          return true;
        }
        continue;
      }

      if (typeof value === 'string' && value) {
        return true;
      }
    }
  }

  return false;
};

export const mergeColumnsWithDraft = (
  defaults: readonly Column[],
  stored: StoredColumnPreference[] | undefined,
): readonly Column[] => {
  if (!stored?.length) {
    return defaults;
  }

  const defaultByKey = new Map(defaults.map((column) => [column.key, column]));
  const storedKeys = new Set(stored.map((column) => column.key));

  const merged: Column[] = stored
    .map(({ key, isShown }) => {
      const column = defaultByKey.get(key);
      return column ? { ...column, isShown } : null;
    })
    .filter((column): column is NonNullable<typeof column> => column !== null);

  for (const column of defaults) {
    if (storedKeys.has(column.key)) {
      continue;
    }

    const defaultIndex = defaults.findIndex((item) => item.key === column.key);
    let insertIndex = merged.length;

    for (let index = 0; index < merged.length; index += 1) {
      const mergedDefaultIndex = defaults.findIndex(
        (item) => item.key === merged[index].key,
      );
      if (mergedDefaultIndex > defaultIndex) {
        insertIndex = index;
        break;
      }
    }

    merged.splice(insertIndex, 0, { ...column });
  }

  return merged;
};

export const toStoredColumnPreferences = (
  columns: readonly Column[],
): StoredColumnPreference[] =>
  columns.map((column) => ({
    key: column.key,
    isShown: column.isShown ?? column.isShownByDefault,
  }));

const setFilterSearchParam = (
  params: URLSearchParams,
  key: keyof InventoryFilters,
  value: InventoryFilters[keyof InventoryFilters],
) => {
  params.delete(key);

  if (Array.isArray(value)) {
    value.forEach((entry) => {
      if (entry) {
        params.append(key, entry);
      }
    });
    return;
  }

  if (value) {
    params.set(key, value);
  }
};

export const applyDraftToSearchParams = (
  searchParams: URLSearchParams,
  draft: InventoryTableDraft,
): URLSearchParams => {
  const params = new URLSearchParams(searchParams);

  TABLE_URL_PARAM_KEYS.forEach((key) => params.delete(key));

  const filters = draft.filters ?? INITIAL_INVENTORY_FILTERS;
  FILTER_PARAM_KEYS.forEach((key) => {
    setFilterSearchParam(params, key, filters[key]);
  });

  if (draft.sort?.sortBy && draft.sort.direction) {
    params.set(SORT_URL_PARAM, draft.sort.sortBy);
    params.set(SORT_DIR_URL_PARAM, draft.sort.direction);
  }

  if (draft.pagination) {
    params.set('page', String(draft.pagination.page));
    params.set('per_page', String(draft.pagination.perPage));
  }

  return params;
};
