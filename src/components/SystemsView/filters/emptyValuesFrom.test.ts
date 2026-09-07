import { expect } from '@jest/globals';
import { emptyValuesFrom } from './emptyValuesFrom';
import {
  hostnameSpec,
  inventoryFilterSpecs,
  INITIAL_INVENTORY_FILTERS,
  statusSpec,
  tagsSpec,
} from './inventory/filterDefinitions';

describe('emptyValuesFrom', () => {
  it('maps each spec filterId to its emptyValue, in spec order', () => {
    expect(emptyValuesFrom([hostnameSpec, statusSpec, tagsSpec])).toEqual({
      hostname_or_id: '',
      status: [],
      tags: [],
    });
  });

  it('adds a URL key when that spec is included', () => {
    const withoutTags = emptyValuesFrom([hostnameSpec, statusSpec]);
    expect(withoutTags).not.toHaveProperty('tags');

    const withTags = emptyValuesFrom([hostnameSpec, statusSpec, tagsSpec]);
    expect(withTags).toHaveProperty('tags', []);
  });

  it('drops a URL key when that spec is removed', () => {
    const withStatus = emptyValuesFrom([hostnameSpec, statusSpec]);
    expect(withStatus).toHaveProperty('status');

    const withoutStatus = emptyValuesFrom([hostnameSpec]);
    expect(withoutStatus).not.toHaveProperty('status');
    expect(Object.keys(withoutStatus)).toEqual(['hostname_or_id']);
  });

  it('matches INITIAL_INVENTORY_FILTERS for the full inventory list', () => {
    expect(emptyValuesFrom(inventoryFilterSpecs)).toEqual(
      INITIAL_INVENTORY_FILTERS,
    );
    expect(Object.keys(INITIAL_INVENTORY_FILTERS)).toEqual(
      inventoryFilterSpecs.map((spec) => spec.filterId),
    );
  });
});
