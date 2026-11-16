import { expect } from '@jest/globals';
import { filterCatalog } from '../catalog';
import { buildFilterParams } from '../buildFilterParams';
import { bindInventoryHostListFilters } from '../inventory/bindInventoryFilters';
import { bindContentFilters } from './bindContentFilters';
import { installableAdvisoryTypeSpec, templateSpec } from './filterDefinitions';

const ctx = { lastSeenCustomRange: null };

const EMPTY_FILTER_STATE = {
  hostname_or_id: '',
  status: [],
  source: [],
  operating_system: [],
  system_type: [],
  group_id: [],
  tags: [],
  workloads: [],
  last_seen: '',
  installable_advisory_type: [],
  template: [],
};

const foldContentParams = (filters: Record<string, unknown>) =>
  buildFilterParams(bindContentFilters(filterCatalog), filters, ctx);

describe('Content filters', () => {
  const filters = bindContentFilters(filterCatalog);

  it('binds exactly the two Content filters, in toolbar order', () => {
    const filterIds = filters.map((filter) => filter.filterId);

    expect(filterIds).toEqual(['installable_advisory_type', 'template']);
  });

  describe('Installable advisory type', () => {
    it('is a checkbox filter, so several advisory types can be picked', () => {
      expect(installableAdvisoryTypeSpec.type).toBe('checkbox');
    });

    it('offers the four advisory types plus not_evaluated', () => {
      expect(
        installableAdvisoryTypeSpec.options.map((option) => option.value),
      ).toEqual([
        'security',
        'bugfix',
        'enhancement',
        'other',
        'not_evaluated',
      ]);
    });

    it('maps multiple advisory types to an OR-semantics param list', () => {
      const params = foldContentParams({
        ...EMPTY_FILTER_STATE,
        installable_advisory_type: ['security', 'bugfix'],
      });

      expect(params.installableAdvisoryType).toEqual(['security', 'bugfix']);
    });

    it('passes not_evaluated through for hosts Content never reported on', () => {
      const params = foldContentParams({
        ...EMPTY_FILTER_STATE,
        installable_advisory_type: ['not_evaluated'],
      });

      expect(params.installableAdvisoryType).toEqual(['not_evaluated']);
    });
  });

  describe('Template', () => {
    it('is a single-select filter', () => {
      expect(templateSpec.type).toBe('single-select');
    });

    it('offers present and not_present only — there is no not_evaluated', () => {
      expect(templateSpec.options.map((option) => option.value)).toEqual([
        'present',
        'not_present',
      ]);
    });

    it('unwraps the single-select array into the scalar the API takes', () => {
      const params = foldContentParams({
        ...EMPTY_FILTER_STATE,
        template: ['present'],
      });

      expect(params.template).toBe('present');
    });

    it('sends not_present as a scalar too', () => {
      const params = foldContentParams({
        ...EMPTY_FILTER_STATE,
        template: ['not_present'],
      });

      expect(params.template).toBe('not_present');
    });
  });

  it('ANDs the two Content filters when both are set', () => {
    const params = foldContentParams({
      ...EMPTY_FILTER_STATE,
      installable_advisory_type: ['security'],
      template: ['not_present'],
    });

    expect(params).toEqual({
      installableAdvisoryType: ['security'],
      template: 'not_present',
    });
  });

  it('omits the Content params when no values are selected', () => {
    const params = foldContentParams(EMPTY_FILTER_STATE);

    expect(params).not.toHaveProperty('installableAdvisoryType');
    expect(params).not.toHaveProperty('template');
  });

  it('keeps the Content filters out of the host-list toolbar', () => {
    // The `/hosts` list endpoint does not support app-data filters, so the
    // host-list binding must never grow them.
    const listFilterIds = bindInventoryHostListFilters(filterCatalog).map(
      (filter) => filter.filterId,
    );

    expect(listFilterIds).not.toContain('installable_advisory_type');
    expect(listFilterIds).not.toContain('template');
  });
});
