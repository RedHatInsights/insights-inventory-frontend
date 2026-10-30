import { expect } from '@jest/globals';
import { filterCatalog } from '../catalog';
import { buildFilterParams } from '../buildFilterParams';
import { bindInventoryHostListFilters } from '../inventory/bindInventoryFilters';
import { bindContentFilters } from './bindContentFilters';

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
  content_template: [],
};

describe('Content filters', () => {
  const filters = bindContentFilters(filterCatalog);

  it('binds exactly the two Content filters, in toolbar order', () => {
    const filterIds = filters.map((filter) => filter.filterId);

    expect(filterIds).toEqual([
      'installable_advisory_type',
      'content_template',
    ]);
  });

  it('maps multiple advisory types to an OR-semantics param list', () => {
    const params = buildFilterParams(
      filters,
      {
        ...EMPTY_FILTER_STATE,
        installable_advisory_type: ['security_advisories', 'bug_fixes'],
      },
      ctx,
    );

    expect(params).toHaveProperty('installableAdvisoryType', [
      'security_advisories',
      'bug_fixes',
    ]);
  });

  it('unwraps the single-select content template value to a single param', () => {
    const params = buildFilterParams(
      filters,
      { ...EMPTY_FILTER_STATE, content_template: ['not_assigned'] },
      ctx,
    );

    expect(params).toHaveProperty('contentTemplate', 'not_assigned');
  });

  it('omits the Content params when no values are selected', () => {
    const params = buildFilterParams(filters, EMPTY_FILTER_STATE, ctx);

    expect(params).not.toHaveProperty('installableAdvisoryType');
    expect(params).not.toHaveProperty('contentTemplate');
  });

  it('keeps the Content filters out of the host-list toolbar', () => {
    // The `/hosts` list endpoint does not support app-data filters, so the
    // host-list binding must never grow them.
    const listFilterIds = bindInventoryHostListFilters(filterCatalog).map(
      (filter) => filter.filterId,
    );

    expect(listFilterIds).not.toContain('installable_advisory_type');
    expect(listFilterIds).not.toContain('content_template');
  });
});
