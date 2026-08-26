import { expect } from '@jest/globals';
import type { InventoryFilters } from '../../SystemsView/filters/SystemsViewFilters';
import {
  isSortDirty,
  areFiltersDirty,
  areColumnsDirty,
} from './useViewDirtyState';

const makeParams = (entries: Record<string, string | string[]> = {}) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value);
    }
  }
  return params;
};

const makeColumn = (key: string, isShown: boolean) => ({ key, isShown });

describe('isSortDirty', () => {
  it('returns false when no sort params in URL', () => {
    expect(
      isSortDirty(makeParams(), { key: 'display_name', direction: 'asc' }),
    ).toBe(false);
  });

  it('returns false when URL sort matches saved sort', () => {
    const params = makeParams({ sort: 'display_name', sort_dir: 'asc' });
    expect(isSortDirty(params, { key: 'display_name', direction: 'asc' })).toBe(
      false,
    );
  });

  it('returns true when sort key differs', () => {
    const params = makeParams({ sort: 'last_check_in', sort_dir: 'asc' });
    expect(isSortDirty(params, { key: 'display_name', direction: 'asc' })).toBe(
      true,
    );
  });

  it('returns true when sort direction differs', () => {
    const params = makeParams({ sort: 'display_name', sort_dir: 'desc' });
    expect(isSortDirty(params, { key: 'display_name', direction: 'asc' })).toBe(
      true,
    );
  });

  it('returns false when only sort key is in URL and matches', () => {
    const params = makeParams({ sort: 'display_name' });
    expect(
      isSortDirty(params, { key: 'display_name', direction: 'desc' }),
    ).toBe(false);
  });

  it('falls back to INITIAL_SORT when no saved sort', () => {
    // INITIAL_SORT = { sortBy: 'last_check_in', direction: 'desc' }
    const params = makeParams({ sort: 'last_check_in', sort_dir: 'desc' });
    expect(isSortDirty(params, undefined)).toBe(false);
  });

  it('detects change from INITIAL_SORT default', () => {
    const params = makeParams({ sort: 'display_name', sort_dir: 'asc' });
    expect(isSortDirty(params, undefined)).toBe(true);
  });
});

describe('areFiltersDirty', () => {
  it('returns false when no filters in URL and no initial filters', () => {
    expect(areFiltersDirty(makeParams(), undefined)).toBe(false);
  });

  it('returns true when URL has a filter but initial is empty', () => {
    const params = makeParams({ operating_system: ['RHEL9.6'] });
    expect(areFiltersDirty(params, undefined)).toBe(true);
  });

  it('returns false when URL filters match initial filters', () => {
    const params = makeParams({ operating_system: ['RHEL9.6'] });
    const initial: Partial<InventoryFilters> = {
      operating_system: ['RHEL9.6'],
    };
    expect(areFiltersDirty(params, initial)).toBe(false);
  });

  it('returns true when URL filter value differs from initial', () => {
    const params = makeParams({ operating_system: ['RHEL8.4'] });
    const initial: Partial<InventoryFilters> = {
      operating_system: ['RHEL9.6'],
    };
    expect(areFiltersDirty(params, initial)).toBe(true);
  });

  it('returns true when URL has additional filter values', () => {
    const params = makeParams({ operating_system: ['RHEL9.6', 'RHEL8.4'] });
    const initial: Partial<InventoryFilters> = {
      operating_system: ['RHEL9.6'],
    };
    expect(areFiltersDirty(params, initial)).toBe(true);
  });

  it('returns true when initial filter is removed from URL', () => {
    const params = makeParams();
    const initial: Partial<InventoryFilters> = {
      operating_system: ['RHEL9.6'],
    };
    expect(areFiltersDirty(params, initial)).toBe(true);
  });

  it('handles multiple filter keys independently', () => {
    const params = makeParams({
      operating_system: ['RHEL9.6'],
      tags: ['env=prod'],
    });
    const initial: Partial<InventoryFilters> = {
      operating_system: ['RHEL9.6'],
      tags: ['env=prod'],
    };
    expect(areFiltersDirty(params, initial)).toBe(false);
  });

  it('ignores order of multi-value filters', () => {
    const params = makeParams({ tags: ['b', 'a'] });
    const initial: Partial<InventoryFilters> = { tags: ['a', 'b'] };
    expect(areFiltersDirty(params, initial)).toBe(false);
  });
});

describe('areColumnsDirty', () => {
  it('returns false when baseline is undefined', () => {
    const current = [makeColumn('name', true)];
    expect(areColumnsDirty(undefined, current)).toBe(false);
  });

  it('returns false when current is undefined', () => {
    const baseline = [makeColumn('name', true)];
    expect(areColumnsDirty(baseline, undefined)).toBe(false);
  });

  it('returns false when shown columns match', () => {
    const baseline = [
      makeColumn('name', true),
      makeColumn('os', true),
      makeColumn('tags', false),
    ];
    const current = [
      makeColumn('name', true),
      makeColumn('os', true),
      makeColumn('tags', false),
    ];
    expect(areColumnsDirty(baseline, current)).toBe(false);
  });

  it('returns true when a column is hidden', () => {
    const baseline = [makeColumn('name', true), makeColumn('os', true)];
    const current = [makeColumn('name', true), makeColumn('os', false)];
    expect(areColumnsDirty(baseline, current)).toBe(true);
  });

  it('returns true when a column is shown', () => {
    const baseline = [makeColumn('name', true), makeColumn('os', false)];
    const current = [makeColumn('name', true), makeColumn('os', true)];
    expect(areColumnsDirty(baseline, current)).toBe(true);
  });

  it('returns true when column order changes', () => {
    const baseline = [makeColumn('name', true), makeColumn('os', true)];
    const current = [makeColumn('os', true), makeColumn('name', true)];
    expect(areColumnsDirty(baseline, current)).toBe(true);
  });

  it('returns false when both are empty', () => {
    expect(areColumnsDirty([], [])).toBe(false);
  });
});
