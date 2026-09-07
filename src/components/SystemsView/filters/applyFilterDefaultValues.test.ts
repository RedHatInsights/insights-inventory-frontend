import { expect } from '@jest/globals';
import { applyFilterDefaultValues } from './applyFilterDefaultValues';
import {
  hostnameSpec,
  statusSpec,
  tagsSpec,
} from './inventory/filterDefinitions';
import type { FilterSelector } from './resolveFilterSelector';

const passthrough: FilterSelector = (_catalog) => [
  { ...hostnameSpec, updateQuery: (query) => query },
  { ...statusSpec, updateQuery: (query) => query },
  { ...tagsSpec, updateQuery: (query) => query },
];

describe('stampFilterDefaultValues', () => {
  it('copies matching specs and stamps defaultValue without mutating the source', () => {
    const source = passthrough({} as never);
    const selector = applyFilterDefaultValues(passthrough, {
      hostname_or_id: 'web-01',
      status: ['fresh'],
    });
    const stamped = selector({} as never);

    expect(
      stamped.find((spec) => spec.filterId === 'hostname_or_id'),
    ).toMatchObject({ defaultValue: 'web-01' });
    expect(stamped.find((spec) => spec.filterId === 'status')).toMatchObject({
      defaultValue: ['fresh'],
    });
    expect(stamped.find((spec) => spec.filterId === 'tags')).toMatchObject({
      defaultValue: [],
    });

    expect(
      source.find((spec) => spec.filterId === 'hostname_or_id')?.defaultValue,
    ).toBe('');
    expect(hostnameSpec.defaultValue).toBe('');
    expect(statusSpec.defaultValue).toEqual([]);
  });

  it('ignores default keys that are not in the selector', () => {
    const selector = applyFilterDefaultValues(passthrough, {
      not_a_filter: 'x',
    });

    expect(selector({} as never).map((spec) => spec.filterId)).toEqual([
      'hostname_or_id',
      'status',
      'tags',
    ]);
  });
});
