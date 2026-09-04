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

describe('resolveFilterSelector', () => {
  it('defaults to the full inventory toolbar in catalog order', () => {
    expect(resolveFilterSelector().map((spec) => spec.filterId)).toEqual(
      inventoryFilterSpecs.map((spec) => spec.filterId),
    );
    expect(defaultFilterSelector().map((spec) => spec.filterId)).toEqual(
      inventoryFilterSpecs.map((spec) => spec.filterId),
    );
  });

  it('uses a custom selector when provided', () => {
    const selected = resolveFilterSelector(() => [hostnameSpec, tagsSpec]);

    expect(selected.map((spec) => spec.filterId)).toEqual([
      'hostname_or_id',
      'tags',
    ]);
  });
});
