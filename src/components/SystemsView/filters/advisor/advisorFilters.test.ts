import { expect } from '@jest/globals';
import { filterCatalog } from '../catalog';
import { buildFilterParams } from '../buildFilterParams';
import { bindInventoryHostListFilters } from '../inventory/bindInventoryFilters';
import { bindAdvisorFilters } from './bindAdvisorFilters';

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
  recommendation_severity: [],
  incident_status: [],
};

describe('Advisor filters', () => {
  const filters = bindAdvisorFilters(filterCatalog);

  it('binds exactly the two Advisor filters, in toolbar order', () => {
    const filterIds = filters.map((filter) => filter.filterId);

    expect(filterIds).toEqual(['recommendation_severity', 'incident_status']);
  });

  it('maps multiple severities to an OR-semantics param list', () => {
    const params = buildFilterParams(
      filters,
      { ...EMPTY_FILTER_STATE, recommendation_severity: ['critical', 'low'] },
      ctx,
    );

    expect(params.recommendationSeverity).toEqual(['critical', 'low']);
  });

  it('unwraps the single-select incident value to a single param', () => {
    const params = buildFilterParams(
      filters,
      { ...EMPTY_FILTER_STATE, incident_status: ['no_incident'] },
      ctx,
    );

    expect(params.incidentStatus).toBe('no_incident');
  });

  it('omits the Advisor params when no values are selected', () => {
    const params = buildFilterParams(filters, EMPTY_FILTER_STATE, ctx);

    expect(params).not.toHaveProperty('recommendationSeverity');
    expect(params).not.toHaveProperty('incidentStatus');
  });

  it('keeps the Advisor filters out of the host-list toolbar', () => {
    // The `/hosts` list endpoint does not support app-data filters, so the
    // host-list binding must never grow them.
    const listFilterIds = bindInventoryHostListFilters(filterCatalog).map(
      (filter) => filter.filterId,
    );

    expect(listFilterIds).not.toContain('recommendation_severity');
    expect(listFilterIds).not.toContain('incident_status');
  });
});
