import { applyUrlOverrides } from './applyUrlOverrides';

const params = (init: Record<string, string | string[]>): URLSearchParams => {
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(init)) {
    if (Array.isArray(value)) {
      value.forEach((v) => result.append(key, v));
    } else {
      result.set(key, value);
    }
  }
  return result;
};

const snapshot = (search: URLSearchParams): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  for (const key of new Set(search.keys())) {
    result[key] = search.getAll(key);
  }
  return result;
};

describe('applyUrlOverrides', () => {
  it('returns the base unchanged when there are no overrides', () => {
    const base = params({ view_id: 'v1', sort: 'display_name' });
    expect(snapshot(applyUrlOverrides(base, params({})))).toEqual({
      view_id: ['v1'],
      sort: ['display_name'],
    });
  });

  it('does not mutate the base params', () => {
    const base = params({ sort: 'display_name' });
    applyUrlOverrides(base, params({ sort: 'last_check_in' }));
    expect(base.get('sort')).toBe('display_name');
  });

  it('keeps base keys that are not overridden', () => {
    const base = params({ view_id: 'v1', operating_system: 'RHEL9' });
    const result = applyUrlOverrides(base, params({ hostname_or_id: 'foo' }));
    expect(snapshot(result)).toEqual({
      view_id: ['v1'],
      operating_system: ['RHEL9'],
      hostname_or_id: ['foo'],
    });
  });

  it('lets an override replace a single-valued base key', () => {
    const base = params({ sort: 'display_name', sort_dir: 'asc' });
    const result = applyUrlOverrides(base, params({ sort: 'last_check_in' }));
    expect(snapshot(result)).toEqual({
      sort: ['last_check_in'],
      sort_dir: ['asc'],
    });
  });

  it('replaces all values of a multi-valued base key, not appends', () => {
    const base = params({ operating_system: ['RHEL9', 'RHEL8'] });
    const result = applyUrlOverrides(
      base,
      params({ operating_system: ['CentOS7'] }),
    );
    expect(snapshot(result)).toEqual({ operating_system: ['CentOS7'] });
  });

  it('preserves multiple override values for a key', () => {
    const base = params({ status: 'fresh' });
    const result = applyUrlOverrides(
      base,
      params({ status: ['stale', 'warning'] }),
    );
    expect(snapshot(result)).toEqual({ status: ['stale', 'warning'] });
  });

  it('merges config defaults with URL params winning on conflict', () => {
    const configProjected = params({
      view_id: 'default',
      operating_system: 'RHEL9',
      sort: 'display_name',
      sort_dir: 'asc',
    });
    const urlParams = params({ hostname_or_id: 'foo', sort: 'last_check_in' });
    const result = applyUrlOverrides(configProjected, urlParams);
    expect(snapshot(result)).toEqual({
      view_id: ['default'],
      operating_system: ['RHEL9'],
      sort: ['last_check_in'],
      sort_dir: ['asc'],
      hostname_or_id: ['foo'],
    });
  });
});
