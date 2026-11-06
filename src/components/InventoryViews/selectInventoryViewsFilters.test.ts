import { expect } from '@jest/globals';
import { filterCatalog } from '../SystemsView/filters/catalog';
import { buildFilterParams } from '../SystemsView/filters/buildFilterParams';
import { defaultValuesFrom } from '../SystemsView/filters/defaultValuesFrom';
import { inventoryFilterSpecs } from '../SystemsView/filters/inventory/filterDefinitions';
import {
  getInventoryViewsFilterSpecs,
  inventoryViewsAppDataFilterSpecs,
  inventoryViewsBaseFilterSpecs,
  inventoryViewsFilterSpecs,
} from './inventoryViewsFilterSpecs';
import type { FilterSelector } from '../SystemsView/filters/resolveFilterSelector';
import { selectLegacyInventoryFilters } from './selectLegacyInventoryFilters';
import {
  getInventoryViewsFilterSelector,
  selectInventoryViewsBaseFilters,
  selectInventoryViewsFilters,
} from './selectInventoryViewsFilters';

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

  it('adds app-data filters on top of the legacy toolbar', () => {
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
      'cve_severity',
      'known_exploit',
      'security_rule',
    ]);
  });

  it('omits the app-data filters when the feature flag is off', () => {
    const appDataFilterIds = inventoryViewsAppDataFilterSpecs.map(
      (spec) => spec.filterId,
    );
    const baseFilterIds = selectInventoryViewsBaseFilters(filterCatalog).map(
      (filter) => filter.filterId,
    );

    expect(baseFilterIds).toEqual(
      inventoryFilterSpecs.map((spec) => spec.filterId),
    );
    for (const filterId of appDataFilterIds) {
      expect(baseFilterIds).not.toContain(filterId);
    }
  });

  it('getInventoryViewsFilterSelector follows the feature flag', () => {
    expect(getInventoryViewsFilterSelector(true)).toBe(
      selectInventoryViewsFilters,
    );
    expect(getInventoryViewsFilterSelector(false)).toBe(
      selectInventoryViewsBaseFilters,
    );
  });

  it('getInventoryViewsFilterSpecs stays aligned with the matching selector', () => {
    for (const isEnabled of [true, false]) {
      expect(
        getInventoryViewsFilterSelector(isEnabled)(filterCatalog).map(
          (filter) => filter.filterId,
        ),
      ).toEqual(
        getInventoryViewsFilterSpecs(isEnabled).map((spec) => spec.filterId),
      );
    }

    expect(getInventoryViewsFilterSpecs(true)).toBe(inventoryViewsFilterSpecs);
    expect(getInventoryViewsFilterSpecs(false)).toBe(
      inventoryViewsBaseFilterSpecs,
    );
  });

  it('gated filters produce no query params when the flag is off', () => {
    const full = selectInventoryViewsFilters(filterCatalog);
    const base = selectInventoryViewsBaseFilters(filterCatalog);
    const ui = {
      ...defaultValuesFrom(full),
      cve_severity: ['critical'],
      incident_status: ['incident'],
    };
    const ctx = { lastSeenCustomRange: null };

    expect(buildFilterParams(full, ui, ctx)).toEqual(
      expect.objectContaining({
        cveSeverity: ['critical'],
        incidentStatus: 'incident',
      }),
    );

    const baseParams = buildFilterParams(base, ui, ctx);
    expect(baseParams).not.toHaveProperty('cveSeverity');
    expect(baseParams).not.toHaveProperty('incidentStatus');
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
