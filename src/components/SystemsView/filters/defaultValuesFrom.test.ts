import { expect } from '@jest/globals';
import {
  defaultValuesFrom,
  filterValuesEqual,
  filtersDifferFromDefaults,
  hasActiveFilterChips,
  isEmptyFilterValue,
} from './defaultValuesFrom';
import {
  hostnameSpec,
  inventoryFilterSpecs,
  statusSpec,
  tagsSpec,
} from './inventory/filterDefinitions';

describe('isEmptyFilterValue', () => {
  it('treats PatternFly empty resets as empty', () => {
    expect(isEmptyFilterValue('')).toBe(true);
    expect(isEmptyFilterValue([])).toBe(true);
    expect(isEmptyFilterValue(null)).toBe(true);
    expect(isEmptyFilterValue(undefined)).toBe(true);
  });

  it('treats default values as non-empty', () => {
    expect(isEmptyFilterValue('web-01')).toBe(false);
    expect(isEmptyFilterValue(['ansible'])).toBe(false);
  });
});

describe('filterValuesEqual', () => {
  it('treats PatternFly empty resets as equal', () => {
    expect(filterValuesEqual('', [])).toBe(true);
    expect(filterValuesEqual(undefined, '')).toBe(true);
    expect(filterValuesEqual([], null)).toBe(true);
  });

  it('treats checkbox arrays as equal regardless of order', () => {
    expect(filterValuesEqual(['fresh', 'stale'], ['stale', 'fresh'])).toBe(
      true,
    );
  });

  it('detects a different text or checkbox value', () => {
    expect(filterValuesEqual('web-01', 'web-02')).toBe(false);
    expect(filterValuesEqual(['stale'], ['fresh'])).toBe(false);
    expect(filterValuesEqual(['stale'], [])).toBe(false);
  });
});

describe('filtersDifferFromDefaults', () => {
  it('is false when live values match spec defaultValue', () => {
    expect(
      filtersDifferFromDefaults({ hostname_or_id: '', status: [] }, [
        hostnameSpec,
        statusSpec,
      ]),
    ).toBe(false);
  });

  it('is false when live values match stamped defaultValue', () => {
    expect(
      filtersDifferFromDefaults({ hostname_or_id: '', status: ['stale'] }, [
        hostnameSpec,
        { ...statusSpec, defaultValue: ['stale'] },
      ]),
    ).toBe(false);
  });

  it('is true when a live value differs from spec defaultValue', () => {
    expect(
      filtersDifferFromDefaults({ hostname_or_id: 'web-01', status: [] }, [
        hostnameSpec,
        statusSpec,
      ]),
    ).toBe(true);
  });

  it('is true when a stamped default is cleared', () => {
    expect(
      filtersDifferFromDefaults({ hostname_or_id: '', status: [] }, [
        hostnameSpec,
        { ...statusSpec, defaultValue: ['stale'] },
      ]),
    ).toBe(true);
  });

  it('ignores live keys that are not in the spec list', () => {
    expect(
      filtersDifferFromDefaults(
        { hostname_or_id: '', status: ['fresh'], tags: ['env=prod'] },
        [hostnameSpec, statusSpec],
      ),
    ).toBe(true);
    expect(
      filtersDifferFromDefaults({ hostname_or_id: '', tags: ['env=prod'] }, [
        hostnameSpec,
      ]),
    ).toBe(false);
  });
});

describe('hasActiveFilterChips', () => {
  it('is false when every spec value is empty', () => {
    expect(
      hasActiveFilterChips({ hostname_or_id: '', status: [] }, [
        hostnameSpec,
        statusSpec,
      ]),
    ).toBe(false);
  });

  it('is true when a spec has a chip value', () => {
    expect(
      hasActiveFilterChips({ hostname_or_id: 'web-01', status: [] }, [
        hostnameSpec,
        statusSpec,
      ]),
    ).toBe(true);
  });

  it('ignores live keys that are not in the spec list', () => {
    expect(
      hasActiveFilterChips({ hostname_or_id: '', tags: ['env=prod'] }, [
        hostnameSpec,
      ]),
    ).toBe(false);
  });
});

describe('defaultValuesFrom', () => {
  it('maps each spec filterId to its defaultValue, in spec order', () => {
    expect(defaultValuesFrom([hostnameSpec, statusSpec, tagsSpec])).toEqual({
      hostname_or_id: '',
      status: [],
      tags: [],
    });
  });

  it('adds a URL key when that spec is included', () => {
    const withoutTags = defaultValuesFrom([hostnameSpec, statusSpec]);
    expect(withoutTags).not.toHaveProperty('tags');

    const withTags = defaultValuesFrom([hostnameSpec, statusSpec, tagsSpec]);
    expect(withTags).toHaveProperty('tags', []);
  });

  it('drops a URL key when that spec is removed', () => {
    const withStatus = defaultValuesFrom([hostnameSpec, statusSpec]);
    expect(withStatus).toHaveProperty('status');

    const withoutStatus = defaultValuesFrom([hostnameSpec]);
    expect(withoutStatus).not.toHaveProperty('status');
    expect(Object.keys(withoutStatus)).toEqual(['hostname_or_id']);
  });

  it('uses every inventory spec filterId as a key, in spec order', () => {
    expect(Object.keys(defaultValuesFrom(inventoryFilterSpecs))).toEqual(
      inventoryFilterSpecs.map((spec) => spec.filterId),
    );
  });

  it('uses a stamped defaultValue instead of the catalog zero', () => {
    expect(
      defaultValuesFrom([
        hostnameSpec,
        { ...statusSpec, defaultValue: ['stale'] },
      ]),
    ).toEqual({
      hostname_or_id: '',
      status: ['stale'],
    });
  });
});
