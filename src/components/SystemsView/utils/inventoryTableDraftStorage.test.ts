import defaultColumns from '../columns/allColumnDefinitions';
import { INITIAL_INVENTORY_FILTERS } from '../inventoryFilterDefaults';
import {
  applyDraftToSearchParams,
  clearInventoryTableDraftFilters,
  getInventoryTableDraftStorageKey,
  getOrgIdFromChromeUser,
  hasFilterOrSortInUrl,
  hasPersistedTableState,
  INVENTORY_TABLE_DRAFT_VERSION,
  mergeColumnsWithDraft,
  readInventoryTableDraft,
  saveInventoryTableDraft,
  writeInventoryTableDraft,
} from './inventoryTableDraftStorage';

const ORG_ID = 'test-org-123';

describe('inventoryTableDraftStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('scopes storage keys by org id', () => {
    expect(getInventoryTableDraftStorageKey(ORG_ID)).toBe(
      `insights.inventory.systems-view.draft.${ORG_ID}`,
    );
  });

  it('reads org id from chrome user identity', () => {
    expect(
      getOrgIdFromChromeUser({
        identity: { internal: { org_id: 'org-1' }, account_number: 'acc-1' },
      }),
    ).toBe('org-1');

    expect(
      getOrgIdFromChromeUser({
        identity: { account_number: 'acc-2' },
      }),
    ).toBe('acc-2');
  });

  it('writes and reads a draft', () => {
    saveInventoryTableDraft(ORG_ID, {
      filters: { ...INITIAL_INVENTORY_FILTERS, status: ['fresh'] },
    });

    expect(readInventoryTableDraft(ORG_ID)).toEqual({
      version: INVENTORY_TABLE_DRAFT_VERSION,
      filters: { ...INITIAL_INVENTORY_FILTERS, status: ['fresh'] },
    });
  });

  it('ignores invalid stored drafts', () => {
    window.localStorage.setItem(
      getInventoryTableDraftStorageKey(ORG_ID),
      '{not-json',
    );
    expect(readInventoryTableDraft(ORG_ID)).toBeNull();

    window.localStorage.setItem(
      getInventoryTableDraftStorageKey(ORG_ID),
      JSON.stringify({ version: 99 }),
    );
    expect(readInventoryTableDraft(ORG_ID)).toBeNull();
  });

  it('detects filter and sort params in the url', () => {
    expect(hasFilterOrSortInUrl(new URLSearchParams())).toBe(false);
    expect(
      hasFilterOrSortInUrl(new URLSearchParams('page=2&per_page=50')),
    ).toBe(false);
    expect(hasFilterOrSortInUrl(new URLSearchParams('status=fresh'))).toBe(
      true,
    );
    expect(hasFilterOrSortInUrl(new URLSearchParams('sort=display_name'))).toBe(
      true,
    );
  });

  it('detects meaningful persisted table state', () => {
    expect(
      hasPersistedTableState({
        version: INVENTORY_TABLE_DRAFT_VERSION,
      }),
    ).toBe(false);

    expect(
      hasPersistedTableState({
        version: INVENTORY_TABLE_DRAFT_VERSION,
        columns: [{ key: 'name', isShown: true }],
      }),
    ).toBe(true);

    expect(
      hasPersistedTableState({
        version: INVENTORY_TABLE_DRAFT_VERSION,
        filters: { ...INITIAL_INVENTORY_FILTERS, hostname_or_id: 'web' },
      }),
    ).toBe(true);
  });

  it('merges stored columns with defaults and inserts new columns', () => {
    const stored = [
      { key: 'os', isShown: true },
      { key: 'name', isShown: false },
    ];

    const merged = mergeColumnsWithDraft(defaultColumns, stored);
    expect(merged.find((column) => column.key === 'name')?.isShown).toBe(false);
    expect(merged.find((column) => column.key === 'os')?.isShown).toBe(true);
    expect(merged.map((column) => column.key).indexOf('os')).toBeLessThan(
      merged.map((column) => column.key).indexOf('name'),
    );
    expect(merged.length).toBe(defaultColumns.length);
  });

  it('applies draft filters and sort to search params', () => {
    const params = applyDraftToSearchParams(new URLSearchParams('page=9'), {
      version: INVENTORY_TABLE_DRAFT_VERSION,
      filters: {
        ...INITIAL_INVENTORY_FILTERS,
        status: ['fresh'],
        hostname_or_id: 'web',
      },
      sort: { sortBy: 'display_name', direction: 'asc' },
      pagination: { page: 2, perPage: 25 },
    });

    expect(params.get('hostname_or_id')).toBe('web');
    expect(params.getAll('status')).toEqual(['fresh']);
    expect(params.get('sort')).toBe('display_name');
    expect(params.get('sort_dir')).toBe('asc');
    expect(params.get('page')).toBe('2');
    expect(params.get('per_page')).toBe('25');
  });

  it('clears filter state while preserving columns', () => {
    writeInventoryTableDraft(ORG_ID, {
      version: INVENTORY_TABLE_DRAFT_VERSION,
      columns: [{ key: 'name', isShown: true }],
      filters: {
        ...INITIAL_INVENTORY_FILTERS,
        hostname_or_id: 'web',
      },
      lastSeenCustomRange: { start: '2024-01-01', end: '2024-01-02' },
    });

    clearInventoryTableDraftFilters(ORG_ID);

    expect(readInventoryTableDraft(ORG_ID)).toEqual({
      version: INVENTORY_TABLE_DRAFT_VERSION,
      columns: [{ key: 'name', isShown: true }],
      filters: { ...INITIAL_INVENTORY_FILTERS },
      lastSeenCustomRange: null,
    });
  });
});
