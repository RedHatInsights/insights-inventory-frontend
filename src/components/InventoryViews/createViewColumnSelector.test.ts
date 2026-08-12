import { expect } from '@jest/globals';
import allColumns from '../SystemsView/columns/allColumnDefinitions';
import { createViewColumnSelector } from './createViewColumnSelector';

describe('createViewColumnSelector', () => {
  it('returns undefined when configuration is undefined', () => {
    expect(createViewColumnSelector(undefined)).toBeUndefined();
  });

  it('hides all columns when columns array is empty', () => {
    const selector = createViewColumnSelector({ columns: [] });
    expect(selector).toBeDefined();

    const result = selector!(allColumns);
    expect(result).toHaveLength(allColumns.length);
    expect(result.every((c) => !c.isShown)).toBe(true);
    expect(result.every((c) => !c.isShownByDefault)).toBe(true);
  });

  it('shows only configured columns as visible', () => {
    const selector = createViewColumnSelector({
      columns: [
        { key: 'display_name' },
        { key: 'operating_system' },
        { key: 'vulnerability:total_cves' },
      ],
    });
    const result = selector!(allColumns);

    const shownKeys = result.filter((c) => c.isShown).map((c) => c.key);
    expect(shownKeys).toEqual([
      'display_name',
      'operating_system',
      'vulnerability:total_cves',
    ]);
  });

  it('marks all configured columns as visible', () => {
    const selector = createViewColumnSelector({
      columns: [
        { key: 'display_name' },
        { key: 'operating_system' },
        { key: 'last_check_in' },
      ],
    });
    const result = selector!(allColumns);

    for (const key of ['display_name', 'operating_system', 'last_check_in']) {
      const col = result.find((c) => c.key === key);
      expect(col?.isShown).toBe(true);
      expect(col?.isShownByDefault).toBe(true);
    }
  });

  it('appends unconfigured catalog columns at the end, hidden', () => {
    const selector = createViewColumnSelector({
      columns: [{ key: 'display_name' }, { key: 'operating_system' }],
    });
    const result = selector!(allColumns);

    expect(result).toHaveLength(allColumns.length);

    const resultKeys = result.map((c) => c.key);
    expect(resultKeys[0]).toBe('display_name');
    expect(resultKeys[1]).toBe('operating_system');

    const unconfigured = result.slice(2);
    expect(unconfigured.every((c) => !c.isShown)).toBe(true);
    expect(unconfigured.every((c) => !c.isShownByDefault)).toBe(true);
  });

  it('preserves config order for columns', () => {
    const selector = createViewColumnSelector({
      columns: [
        { key: 'last_check_in' },
        { key: 'vulnerability:total_cves' },
        { key: 'display_name' },
      ],
    });
    const result = selector!(allColumns);

    const firstThree = result.slice(0, 3).map((c) => c.key);
    expect(firstThree).toEqual([
      'last_check_in',
      'vulnerability:total_cves',
      'display_name',
    ]);
  });

  it('ignores config keys that do not exist in the catalog', () => {
    const selector = createViewColumnSelector({
      columns: [
        { key: 'display_name' },
        { key: 'nonexistent_column' },
        { key: 'operating_system' },
      ],
    });
    const result = selector!(allColumns);

    expect(result).toHaveLength(allColumns.length);
    const shownKeys = result.filter((c) => c.isShown).map((c) => c.key);
    expect(shownKeys).toEqual(['display_name', 'operating_system']);
  });
});
