import { expect } from '@jest/globals';
import { filterCatalog } from '../SystemsView/filters/catalog';
import { buildFilterParams } from '../SystemsView/filters/buildFilterParams';
import { defaultValuesFrom } from '../SystemsView/filters/defaultValuesFrom';
import { inventoryFilterSpecs } from '../SystemsView/filters/inventory/filterDefinitions';
import type { FilterSelector } from '../SystemsView/filters/resolveFilterSelector';
import { selectLegacyInventoryFilters } from './selectLegacyInventoryFilters';
import { selectInventoryViewsFilters } from './selectInventoryViewsFilters';

const dropTags =
  <TFilterParams>(
    selector: FilterSelector<TFilterParams>,
  ): FilterSelector<TFilterParams> =>
  (catalog) =>
    selector(catalog).filter((filter) => filter.filterId !== 'tags');

describe('selectLegacyInventoryFilters', () => {
  it('selects the full inventory toolbar in catalog order', () => {
    expect(
      selectLegacyInventoryFilters(filterCatalog).map(
        (filter) => filter.filterId,
      ),
    ).toEqual(inventoryFilterSpecs.map((spec) => spec.filterId));
  });

  it('dropping one factory removes the control, its URL key, and its query field', () => {
    const full = selectLegacyInventoryFilters(filterCatalog);
    const withoutTags = dropTags(selectLegacyInventoryFilters)(filterCatalog);
    const ui = {
      ...defaultValuesFrom(full),
      tags: ['namespace/key=value'],
    };
    const ctx = { lastSeenCustomRange: null };

    expect(full.map((filter) => filter.filterId)).toContain('tags');
    expect(withoutTags.map((filter) => filter.filterId)).not.toContain('tags');

    expect(defaultValuesFrom(full)).toHaveProperty('tags');
    expect(defaultValuesFrom(withoutTags)).not.toHaveProperty('tags');

    expect(buildFilterParams(full, ui, ctx, {})).toEqual(
      expect.objectContaining({ tags: ['namespace/key=value'] }),
    );
    expect(buildFilterParams(withoutTags, ui, ctx, {})).not.toHaveProperty(
      'tags',
    );
  });
});

describe('selectInventoryViewsFilters', () => {
  it('selects the full inventory toolbar in catalog order', () => {
    expect(
      selectInventoryViewsFilters(filterCatalog).map(
        (filter) => filter.filterId,
      ),
    ).toEqual(inventoryFilterSpecs.map((spec) => spec.filterId));
  });

  it('dropping one factory removes the control, its URL key, and its query field', () => {
    const full = selectInventoryViewsFilters(filterCatalog);
    const withoutTags = dropTags(selectInventoryViewsFilters)(filterCatalog);
    const ui = {
      ...defaultValuesFrom(full),
      tags: ['namespace/key=value'],
    };
    const ctx = { lastSeenCustomRange: null };

    expect(withoutTags.map((filter) => filter.filterId)).not.toContain('tags');
    expect(defaultValuesFrom(withoutTags)).not.toHaveProperty('tags');
    expect(buildFilterParams(withoutTags, ui, ctx, {})).not.toHaveProperty(
      'tags',
    );
    expect(buildFilterParams(full, ui, ctx, {})).toEqual(
      expect.objectContaining({ tags: ['namespace/key=value'] }),
    );
  });
});
