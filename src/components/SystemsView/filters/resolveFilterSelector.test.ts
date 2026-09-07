import { expect } from '@jest/globals';
import {
  inventoryFilterSpecs,
  hostnameSpec,
  tagsSpec,
} from './inventory/filterDefinitions';
import {
  defaultFilterSelector,
  resolveFilterSelector,
} from './resolveFilterSelector';
import { filterCatalog } from './catalog';

describe('resolveFilterSelector', () => {
  it('defaults to the full inventory toolbar in catalog order', () => {
    expect(resolveFilterSelector().map((spec) => spec.filterId)).toEqual(
      inventoryFilterSpecs.map((spec) => spec.filterId),
    );
    expect(
      defaultFilterSelector(filterCatalog).map((spec) => spec.filterId),
    ).toEqual(inventoryFilterSpecs.map((spec) => spec.filterId));
  });

  it('binds default filters with updateQuery', () => {
    expect(
      resolveFilterSelector().every(
        (filter) => typeof filter.updateQuery === 'function',
      ),
    ).toBe(true);
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
