import { expect } from '@jest/globals';
import type { InventoryFilters } from '../../SystemsView/filters/SystemsViewFilters';
import { buildHostFilters } from './buildHostFilters';

const EMPTY_FILTERS: Pick<
  InventoryFilters,
  | 'hostname_or_id'
  | 'status'
  | 'source'
  | 'tags'
  | 'group_id'
  | 'system_type'
  | 'last_seen'
> = {
  hostname_or_id: '',
  status: [],
  source: [],
  tags: [],
  group_id: [],
  system_type: [],
  last_seen: '',
};

describe('buildHostFilters', () => {
  it('returns undefined when no host filters are active', () => {
    expect(buildHostFilters(EMPTY_FILTERS)).toBeUndefined();
  });

  it('maps the simple host-level filters', () => {
    expect(
      buildHostFilters({
        ...EMPTY_FILTERS,
        hostname_or_id: 'prod',
        status: ['fresh', 'stale'],
        source: ['puptoo', 'yupana'],
        tags: ['env/prod'],
        group_id: ['workspace-1'],
      }),
    ).toEqual({
      hostname_or_id: 'prod',
      staleness: ['fresh', 'stale'],
      registered_with: ['puptoo', 'yupana'],
      tags: ['env/prod'],
      workspace_name: ['workspace-1'],
    });
  });

  it('expands the image system type to bootc and edge', () => {
    expect(
      buildHostFilters({
        ...EMPTY_FILTERS,
        system_type: ['conventional', 'image'],
      }),
    ).toEqual({ system_type: ['conventional', 'bootc', 'edge'] });
  });

  it('drops system-type values outside the valid enum', () => {
    expect(
      buildHostFilters({
        ...EMPTY_FILTERS,
        system_type: ['conventional', 'bogus'],
      }),
    ).toEqual({ system_type: ['conventional'] });
  });

  it('maps a preset last_seen to a single last_check_in bound', () => {
    const result = buildHostFilters({ ...EMPTY_FILTERS, last_seen: '15more' });

    expect(result?.last_check_in_end).toBeDefined();
    expect(result?.last_check_in_start).toBeUndefined();
  });

  it('maps a custom last_seen range to both last_check_in bounds', () => {
    const result = buildHostFilters(
      { ...EMPTY_FILTERS, last_seen: 'custom' },
      { start: '2026-07-29T00:00:00.000Z', end: '2026-07-30T23:59:59.999Z' },
    );

    expect(result).toEqual({
      last_check_in_start: '2026-07-29T00:00:00.000Z',
      last_check_in_end: '2026-07-30T23:59:59.999Z',
    });
  });

  it('maps an open-ended custom range with only a start bound', () => {
    expect(
      buildHostFilters(
        { ...EMPTY_FILTERS, last_seen: 'custom' },
        { start: '2026-07-29T00:00:00.000Z' },
      ),
    ).toEqual({ last_check_in_start: '2026-07-29T00:00:00.000Z' });
  });

  it('maps an open-ended custom range with only an end bound', () => {
    expect(
      buildHostFilters(
        { ...EMPTY_FILTERS, last_seen: 'custom' },
        { end: '2026-07-30T23:59:59.999Z' },
      ),
    ).toEqual({ last_check_in_end: '2026-07-30T23:59:59.999Z' });
  });

  it('returns undefined when custom has no bounds selected', () => {
    expect(
      buildHostFilters({ ...EMPTY_FILTERS, last_seen: 'custom' }, {}),
    ).toBeUndefined();
  });
});
