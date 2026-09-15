import { createViewColumnSelector } from './createViewColumnSelector';
import { bindInventoryViewColumns } from '../SystemsView/columns/inventoryViewColumns';
import { columnCatalog } from '../SystemsView/columns/catalog';
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

describe('View column round-trip (save → restore)', () => {
  it('round-trips sortable columns correctly', () => {
    // Start with a selection of sortable columns
    const originalColumns = bindInventoryViewColumns().map((col) => ({
      ...col,
      isShown: ['display_name', 'operating_system', 'last_check_in'].includes(
        col.key,
      ),
      isShownByDefault: [
        'display_name',
        'operating_system',
        'last_check_in',
      ].includes(col.key),
    }));

    // Save to ViewConfiguration
    const savedConfig: ViewConfiguration = {
      columns: normalizeViewColumns(originalColumns),
    };

    // Restore from ViewConfiguration
    const selector = createViewColumnSelector(savedConfig);
    const restoredColumns = selector!(columnCatalog);

    // Verify: shown columns match
    const originalShownKeys = originalColumns
      .filter((c) => c.isShown)
      .map((c) => c.key);
    const restoredShownKeys = restoredColumns
      .filter((c) => c.isShown)
      .map((c) => c.key);

    expect(restoredShownKeys).toEqual(originalShownKeys);
  });

  it('round-trips NON-SORTABLE columns correctly (tags, infrastructure, vendor, workload, created)', () => {
    // Start with a selection that includes non-sortable columns
    const originalColumns = bindInventoryViewColumns().map((col) => ({
      ...col,
      isShown: [
        'display_name',
        'tags', // Non-sortable
        'operating_system',
        'infrastructure', // Non-sortable
        'vendor', // Non-sortable
        'workload', // Non-sortable
        'created', // Non-sortable
      ].includes(col.key),
      isShownByDefault: [
        'display_name',
        'tags',
        'operating_system',
        'infrastructure',
        'vendor',
        'workload',
        'created',
      ].includes(col.key),
    }));

    // Save to ViewConfiguration
    const savedConfig: ViewConfiguration = {
      columns: normalizeViewColumns(originalColumns),
    };

    // Verify: saved config includes non-sortable columns
    const savedKeys = savedConfig.columns.map((c) => c.key);
    expect(savedKeys).toContain('tags');
    expect(savedKeys).toContain('infrastructure');
    expect(savedKeys).toContain('vendor');
    expect(savedKeys).toContain('workload');
    expect(savedKeys).toContain('created');

    // Restore from ViewConfiguration
    const selector = createViewColumnSelector(savedConfig);
    const restoredColumns = selector!(columnCatalog);

    // Verify: restored columns match original
    const originalShownKeys = originalColumns
      .filter((c) => c.isShown)
      .map((c) => c.key);
    const restoredShownKeys = restoredColumns
      .filter((c) => c.isShown)
      .map((c) => c.key);

    expect(restoredShownKeys).toEqual(originalShownKeys);
  });

  it('round-trips app columns correctly (vulnerability, advisor, compliance)', () => {
    // Start with a selection that includes app columns
    const originalColumns = bindInventoryViewColumns().map((col) => ({
      ...col,
      isShown: [
        'display_name',
        'vulnerability:critical_cves',
        'advisor:critical',
        'compliance:policies_count',
      ].includes(col.key),
      isShownByDefault: [
        'display_name',
        'vulnerability:critical_cves',
        'advisor:critical',
        'compliance:policies_count',
      ].includes(col.key),
    }));

    // Save to ViewConfiguration
    const savedConfig: ViewConfiguration = {
      columns: normalizeViewColumns(originalColumns),
    };

    // Restore from ViewConfiguration
    const selector = createViewColumnSelector(savedConfig);
    const restoredColumns = selector!(columnCatalog);

    // Verify: shown columns match
    const originalShownKeys = originalColumns
      .filter((c) => c.isShown)
      .map((c) => c.key);
    const restoredShownKeys = restoredColumns
      .filter((c) => c.isShown)
      .map((c) => c.key);

    expect(restoredShownKeys).toEqual(originalShownKeys);
  });

  it('round-trips mixed sortable + non-sortable + app columns', () => {
    // Realistic selection with all types
    const originalColumns = bindInventoryViewColumns().map((col) => ({
      ...col,
      isShown: [
        'display_name', // Sortable inventory
        'tags', // Non-sortable inventory
        'operating_system', // Sortable inventory
        'infrastructure', // Non-sortable inventory
        'last_check_in', // Sortable inventory
        'vendor', // Non-sortable inventory
        'vulnerability:critical_cves', // App column
        'advisor:critical', // App column
      ].includes(col.key),
      isShownByDefault: [
        'display_name',
        'tags',
        'operating_system',
        'infrastructure',
        'last_check_in',
        'vendor',
        'vulnerability:critical_cves',
        'advisor:critical',
      ].includes(col.key),
    }));

    // Save to ViewConfiguration
    const savedConfig: ViewConfiguration = {
      columns: normalizeViewColumns(originalColumns),
    };

    // Verify: all 8 columns are in saved config
    expect(savedConfig.columns).toHaveLength(8);

    // Restore from ViewConfiguration
    const selector = createViewColumnSelector(savedConfig);
    const restoredColumns = selector!(columnCatalog);

    // Verify: exact match
    const originalShownKeys = originalColumns
      .filter((c) => c.isShown)
      .map((c) => c.key);
    const restoredShownKeys = restoredColumns
      .filter((c) => c.isShown)
      .map((c) => c.key);

    expect(restoredShownKeys).toEqual(originalShownKeys);
  });

  it('preserves column order through round-trip', () => {
    // Custom order: put non-sortable columns first
    const customOrder = [
      'tags',
      'infrastructure',
      'vendor',
      'display_name',
      'operating_system',
      'last_check_in',
    ];

    const originalColumns = bindInventoryViewColumns().map((col) => ({
      ...col,
      isShown: customOrder.includes(col.key),
      isShownByDefault: customOrder.includes(col.key),
    }));

    // Sort by custom order
    const sortedColumns = [...originalColumns].sort((a, b) => {
      const aIndex = customOrder.indexOf(a.key);
      const bIndex = customOrder.indexOf(b.key);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    // Save to ViewConfiguration
    const savedConfig: ViewConfiguration = {
      columns: normalizeViewColumns(sortedColumns.filter((c) => c.isShown)),
    };

    // Restore from ViewConfiguration
    const selector = createViewColumnSelector(savedConfig);
    const restoredColumns = selector!(columnCatalog);

    // Verify: order matches
    const restoredShownKeys = restoredColumns
      .filter((c) => c.isShown)
      .map((c) => c.key);

    expect(restoredShownKeys).toEqual(customOrder);
  });
});
