import { expect } from '@jest/globals';
import { filterCatalog } from '../SystemsView/filters/catalog';
import { buildFilterParams } from '../SystemsView/filters/buildFilterParams';
import { defaultValuesFrom } from '../SystemsView/filters/defaultValuesFrom';
import {
  inventoryFilterSpecs,
  inventoryViewsFilterSpecs,
} from '../SystemsView/filters/inventory/filterDefinitions';
import type { FilterSelector } from '../SystemsView/filters/resolveFilterSelector';
import { selectLegacyInventoryFilters } from './selectLegacyInventoryFilters';
import { selectInventoryViewsFilters } from './selectInventoryViewsFilters';

const dropTags =
  <TFilterParams>(
    selector: FilterSelector<TFilterParams>,
  ): FilterSelector<TFilterParams> =>
  (catalog) =>
    selector(catalog).filter((filter) => filter.filterId !== 'tags');

describe('selectInventoryViewsFilters', () => {
  it('selects the full inventory toolbar in catalog order', () => {
    expect(
      selectInventoryViewsFilters(filterCatalog).map(
        (filter) => filter.filterId,
      ),
    ).toEqual(inventoryViewsFilterSpecs.map((spec) => spec.filterId));
  });

  it('adds the Advisor app-data filters on top of the legacy toolbar', () => {
    const viewsFilterIds = selectInventoryViewsFilters(filterCatalog).map(
      (filter) => filter.filterId,
    );
    const legacyFilterIds = selectLegacyInventoryFilters(filterCatalog).map(
      (filter) => filter.filterId,
    );

    expect(legacyFilterIds).toEqual(
      inventoryFilterSpecs.map((s) => s.filterId),
    );
    expect(viewsFilterIds).toEqual([
      ...legacyFilterIds,
      'recommendation_severity',
      'incident_status',
    ]);
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
    expect(buildFilterParams(withoutTags, ui, ctx)).not.toHaveProperty('tags');
    expect(buildFilterParams(full, ui, ctx)).toEqual(
      expect.objectContaining({ tags: ['namespace/key=value'] }),
    );
  });
});
