import { expect } from '@jest/globals';
import { hostnameSpec, tagsSpec } from './inventory/filterDefinitions';
import {
  defaultFilterSelector,
  resolveFilterSelector,
} from './resolveFilterSelector';

describe('resolveFilterSelector', () => {
  it('returns no filters with the default selector', () => {
    expect(resolveFilterSelector()).toEqual([]);
    expect(defaultFilterSelector()).toEqual([]);
  });

  it('uses a custom selector when provided', () => {
    const selected = resolveFilterSelector((catalog) => [
      catalog.custom(hostnameSpec, { updateQuery: (query) => query }),
      catalog.custom(tagsSpec, { updateQuery: (query) => query }),
    ]);

    expect(selected.map((spec) => spec.filterId)).toEqual([
      'hostname_or_id',
      'tags',
    ]);
  });
});
