import { expect } from '@jest/globals';
import allColumns from '../SystemsView/columns/allColumnDefinitions';
import { createViewColumnSelector } from './createViewColumnSelector';

describe('createViewColumnSelector', () => {
  it('returns undefined when configuration is undefined', () => {
    expect(createViewColumnSelector(undefined)).toBeUndefined();
  });

  it('returns undefined when columns array is empty', () => {
    expect(createViewColumnSelector({ columns: [] })).toBeUndefined();
  });

  it('shows only configured columns as visible', () => {
    const selector = createViewColumnSelector({
      columns: [{ key: 'name' }, { key: 'os' }, { key: 'total_cves' }],
    });
    const result = selector!(allColumns);

    const shownKeys = result.filter((c) => c.isShown).map((c) => c.key);
    expect(shownKeys).toEqual(['name', 'os', 'total_cves']);
  });

  it('marks all configured columns as visible', () => {
    const selector = createViewColumnSelector({
      columns: [{ key: 'name' }, { key: 'tags' }, { key: 'os' }],
    });
    const result = selector!(allColumns);

    for (const key of ['name', 'tags', 'os']) {
      const col = result.find((c) => c.key === key);
      expect(col?.isShown).toBe(true);
      expect(col?.isShownByDefault).toBe(true);
    }
  });

  it('appends unconfigured catalog columns at the end, hidden', () => {
    const selector = createViewColumnSelector({
      columns: [{ key: 'name' }, { key: 'os' }],
    });
    const result = selector!(allColumns);

    expect(result).toHaveLength(allColumns.length);

    const resultKeys = result.map((c) => c.key);
    expect(resultKeys[0]).toBe('name');
    expect(resultKeys[1]).toBe('os');

    const unconfigured = result.slice(2);
    expect(unconfigured.every((c) => !c.isShown)).toBe(true);
    expect(unconfigured.every((c) => !c.isShownByDefault)).toBe(true);
  });

  it('preserves config order for columns', () => {
    const selector = createViewColumnSelector({
      columns: [{ key: 'last_seen' }, { key: 'total_cves' }, { key: 'name' }],
    });
    const result = selector!(allColumns);

    const firstThree = result.slice(0, 3).map((c) => c.key);
    expect(firstThree).toEqual(['last_seen', 'total_cves', 'name']);
  });

  it('ignores config keys that do not exist in the catalog', () => {
    const selector = createViewColumnSelector({
      columns: [{ key: 'name' }, { key: 'nonexistent_column' }, { key: 'os' }],
    });
    const result = selector!(allColumns);

    expect(result).toHaveLength(allColumns.length);
    const shownKeys = result.filter((c) => c.isShown).map((c) => c.key);
    expect(shownKeys).toEqual(['name', 'os']);
  });
});
