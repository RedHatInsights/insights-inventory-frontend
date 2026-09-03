import type { Column } from '../SystemsView/columns/types';
import type { InventoryBindableItem } from '../SystemsView/columns/inventory/columnDefinitions';
import type { ViewConfiguration } from '../../api/inventoryViewsApi';

// This is the function we're testing (extracted from InventoryViews.tsx)
const normalizeViewColumns = (
  columns: readonly Column<InventoryBindableItem>[],
): ViewConfiguration['columns'] =>
  columns
    .filter((c) => c.isShown === true && typeof c.key === 'string')
    .map((c) => ({ key: c.key }));

describe('normalizeViewColumns', () => {
  it('saves columns with sortBy field', () => {
    const columns = [
      {
        key: 'display_name',
        sortBy: 'display_name',
        isShown: true,
      },
      {
        key: 'operating_system',
        sortBy: 'operating_system',
        isShown: true,
      },
    ] as Column<InventoryBindableItem>[];

    const result = normalizeViewColumns(columns);

    expect(result).toEqual([
      { key: 'display_name' },
      { key: 'operating_system' },
    ]);
  });

  it('saves columns WITHOUT sortBy field (tags, infrastructure, vendor, workload, created)', () => {
    const columns = [
      { key: 'display_name', sortBy: 'display_name', isShown: true },
      { key: 'tags', isShown: true }, // No sortBy
      { key: 'operating_system', sortBy: 'operating_system', isShown: true },
      { key: 'infrastructure', isShown: true }, // No sortBy
      { key: 'vendor', isShown: true }, // No sortBy
      { key: 'workload', isShown: true }, // No sortBy
      { key: 'created', isShown: true }, // No sortBy
    ] as Column<InventoryBindableItem>[];

    const result = normalizeViewColumns(columns);

    expect(result).toEqual([
      { key: 'display_name' },
      { key: 'tags' },
      { key: 'operating_system' },
      { key: 'infrastructure' },
      { key: 'vendor' },
      { key: 'workload' },
      { key: 'created' },
    ]);
  });

  it('filters out hidden columns (isShown: false)', () => {
    const columns = [
      { key: 'display_name', isShown: true },
      { key: 'tags', isShown: false }, // Hidden
      { key: 'operating_system', isShown: true },
      { key: 'infrastructure', isShown: false }, // Hidden
    ] as Column<InventoryBindableItem>[];

    const result = normalizeViewColumns(columns);

    expect(result).toEqual([
      { key: 'display_name' },
      { key: 'operating_system' },
    ]);
  });

  it('filters out columns with no key', () => {
    const columns = [
      { key: 'display_name', isShown: true },
      { isShown: true }, // No key
      { key: 'operating_system', isShown: true },
    ] as Column<InventoryBindableItem>[];

    const result = normalizeViewColumns(columns);

    expect(result).toEqual([
      { key: 'display_name' },
      { key: 'operating_system' },
    ]);
  });

  it('preserves column order', () => {
    const columns = [
      { key: 'created', isShown: true },
      { key: 'tags', isShown: true },
      { key: 'display_name', isShown: true },
      { key: 'vendor', isShown: true },
    ] as Column<InventoryBindableItem>[];

    const result = normalizeViewColumns(columns);

    expect(result.map((c) => c.key)).toEqual([
      'created',
      'tags',
      'display_name',
      'vendor',
    ]);
  });

  it('includes app columns (vulnerability, advisor, compliance, etc.)', () => {
    const columns = [
      { key: 'display_name', isShown: true },
      { key: 'vulnerability:critical_cves', isShown: true },
      { key: 'advisor:critical', isShown: true },
      { key: 'compliance:policies_count', isShown: true },
      { key: 'patch:advisories_rhsa_installable', isShown: true },
    ] as Column<InventoryBindableItem>[];

    const result = normalizeViewColumns(columns);

    expect(result).toEqual([
      { key: 'display_name' },
      { key: 'vulnerability:critical_cves' },
      { key: 'advisor:critical' },
      { key: 'compliance:policies_count' },
      { key: 'patch:advisories_rhsa_installable' },
    ]);
  });

  it('returns empty array when no visible columns', () => {
    const columns = [
      { key: 'display_name', isShown: false },
      { key: 'tags', isShown: false },
    ] as Column<InventoryBindableItem>[];

    const result = normalizeViewColumns(columns);

    expect(result).toEqual([]);
  });

  it('handles mixed sortable and non-sortable columns', () => {
    const columns = [
      { key: 'display_name', sortBy: 'display_name', isShown: true }, // Sortable
      { key: 'tags', isShown: true }, // Non-sortable
      { key: 'operating_system', sortBy: 'operating_system', isShown: true }, // Sortable
      { key: 'infrastructure', isShown: true }, // Non-sortable
      { key: 'last_check_in', sortBy: 'last_check_in', isShown: true }, // Sortable
      { key: 'vendor', isShown: true }, // Non-sortable
    ] as Column<InventoryBindableItem>[];

    const result = normalizeViewColumns(columns);

    expect(result).toEqual([
      { key: 'display_name' },
      { key: 'tags' },
      { key: 'operating_system' },
      { key: 'infrastructure' },
      { key: 'last_check_in' },
      { key: 'vendor' },
    ]);
    expect(result.length).toBe(6);
  });
});
