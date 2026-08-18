import { expect } from '@jest/globals';
import allColumns from './allColumnDefinitions';
import inventoryColumns from './inventory/columnDefinitions';
import {
  type ColumnSelector,
  defaultColumnSelector,
  resolveColumnSelector,
} from './resolveColumnSelector';

const inventoryKeys = inventoryColumns.map((col) => col.key);

describe('resolveColumnSelector', () => {
  it('returns no columns with the default selector', () => {
    expect(resolveColumnSelector()).toEqual([]);
    expect(defaultColumnSelector(allColumns)).toEqual([]);
  });

  it('allows custom selectors to reorder and override visibility', () => {
    const customSelector: ColumnSelector = (all) => {
      const byKey = Object.fromEntries(all.map((col) => [col.key, col]));
      return [
        { ...byKey['operating_system'], isShown: true, isShownByDefault: true },
        { ...byKey['display_name'], isShown: true, isShownByDefault: true },
      ];
    };

    const selected = resolveColumnSelector(customSelector);

    expect(selected.map((col) => col.key)).toEqual([
      'operating_system',
      'display_name',
    ]);
    expect(selected.every((col) => col.isShown)).toBe(true);
  });
});
