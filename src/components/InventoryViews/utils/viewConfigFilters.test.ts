import { expect } from '@jest/globals';
import moment from 'moment';
import type { InventoryFilters } from '../../SystemsView/filters/SystemsViewFilters';
import {
  buildViewConfigFilters,
  parseViewConfigFilters,
  parseViewConfigLastSeenCustomRange,
} from './viewConfigFilters';

const EMPTY_FILTERS: InventoryFilters = {
  operating_system: [],
  workloads: [],
  rhcStatus: [],
  system_type: [],
  hostname_or_id: '',
  status: [],
  source: [],
  tags: [],
  group_id: [],
  last_seen: '',
};

describe('buildViewConfigFilters', () => {
  it('returns undefined when no filters are active', () => {
    expect(buildViewConfigFilters(EMPTY_FILTERS)).toBeUndefined();
  });

  it('converts OS tokens to nested system_profile format', () => {
    const result = buildViewConfigFilters({
      ...EMPTY_FILTERS,
      operating_system: ['RHEL9.4', 'RHEL9.0'],
    });

    expect(result).toEqual({
      system_profile: {
        operating_system: {
          RHEL: { version: { eq: ['9.4', '9.0'] } },
        },
      },
    });
  });

  it('groups multiple OS names separately', () => {
    const result = buildViewConfigFilters({
      ...EMPTY_FILTERS,
      operating_system: ['RHEL9.4', 'CentOS Linux8.5'],
    });

    expect(result).toEqual({
      system_profile: {
        operating_system: {
          RHEL: { version: { eq: ['9.4'] } },
          'CentOS Linux': { version: { eq: ['8.5'] } },
        },
      },
    });
  });

  it('converts workload keys to presence filters', () => {
    const result = buildViewConfigFilters({
      ...EMPTY_FILTERS,
      workloads: ['sap', 'ansible'],
    });

    expect(result).toEqual({
      system_profile: {
        workloads: {
          sap: { is: 'not_nil' },
          ansible: { is: 'not_nil' },
        },
      },
    });
  });

  it('includes hostname_or_id in host filters', () => {
    const result = buildViewConfigFilters({
      ...EMPTY_FILTERS,
      hostname_or_id: 'test-host',
    });

    expect(result).toEqual({
      host: {
        hostname_or_id: 'test-host',
      },
    });
  });

  it('combines system_profile and host filters', () => {
    const result = buildViewConfigFilters({
      ...EMPTY_FILTERS,
      operating_system: ['RHEL9.4'],
      hostname_or_id: 'prod',
      status: ['fresh'],
    });

    expect(result).toEqual({
      system_profile: {
        operating_system: {
          RHEL: { version: { eq: ['9.4'] } },
        },
      },
      host: {
        hostname_or_id: 'prod',
        staleness: ['fresh'],
      },
    });
  });
});

describe('parseViewConfigFilters', () => {
  it('returns undefined for empty or missing filters', () => {
    expect(parseViewConfigFilters(undefined)).toBeUndefined();
    expect(parseViewConfigFilters({} as never)).toBeUndefined();
  });

  it('converts nested OS back to flat tokens', () => {
    const result = parseViewConfigFilters({
      system_profile: {
        operating_system: {
          RHEL: { version: { eq: ['9.4', '9.0'] } },
        },
      },
    } as never);

    expect(result).toEqual({
      operating_system: ['RHEL9.4', 'RHEL9.0'],
    });
  });

  it('converts multiple OS names back to tokens', () => {
    const result = parseViewConfigFilters({
      system_profile: {
        operating_system: {
          RHEL: { version: { eq: ['9.4'] } },
          'CentOS Linux': { version: { eq: ['8.5'] } },
        },
      },
    } as never);

    expect(result).toEqual({
      operating_system: ['RHEL9.4', 'CentOS Linux8.5'],
    });
  });

  it('converts workload presence filters back to keys', () => {
    const result = parseViewConfigFilters({
      system_profile: {
        workloads: {
          sap: { is: 'not_nil' },
          ansible: { is: 'not_nil' },
        },
      },
    } as never);

    expect(result).toEqual({
      workloads: ['sap', 'ansible'],
    });
  });

  it('converts host_type conventional back to system_type', () => {
    const result = parseViewConfigFilters({
      system_profile: {
        host_type: { eq: ['conventional'] },
      },
    } as never);

    expect(result).toEqual({
      system_type: ['conventional'],
    });
  });

  it('converts host_type bootc/edge back to image system_type', () => {
    const result = parseViewConfigFilters({
      system_profile: {
        host_type: { eq: ['bootc', 'edge'] },
      },
    } as never);

    expect(result).toEqual({
      system_type: ['image'],
    });
  });

  it('handles host_type as single string value', () => {
    const result = parseViewConfigFilters({
      system_profile: {
        host_type: { eq: 'edge' },
      },
    } as never);

    expect(result).toEqual({
      system_type: ['image'],
    });
  });

  it('converts host filters back to flat format', () => {
    const result = parseViewConfigFilters({
      host: {
        hostname_or_id: 'test-host',
        staleness: ['fresh'] as unknown as string[],
        registered_with: ['puptoo', 'yupana'] as unknown as string[],
        tags: ['env/prod'],
        workspace_name: ['workspace-1'] as unknown as string[],
        system_type: ['bootc', 'edge'] as unknown as string[],
      },
    } as never);

    expect(result).toEqual({
      hostname_or_id: 'test-host',
      status: ['fresh'],
      source: ['puptoo', 'yupana'],
      tags: ['env/prod'],
      group_id: ['workspace-1'],
      system_type: ['image'],
    });
  });

  it('restores a day-aligned two-sided range as a custom last_seen selection', () => {
    const result = parseViewConfigFilters({
      host: {
        last_check_in_start: moment('2026-07-29').startOf('day').toISOString(),
        last_check_in_end: moment('2026-07-30').endOf('day').toISOString(),
      },
    } as never);

    expect(result).toEqual({ last_seen: 'custom' });
  });

  it('restores a non-day-aligned two-sided range as the last24 preset', () => {
    const result = parseViewConfigFilters({
      host: {
        last_check_in_start: '2026-07-29T13:24:11.000Z',
        last_check_in_end: '2026-07-30T13:24:11.000Z',
      },
    } as never);

    expect(result).toEqual({ last_seen: 'last24' });
  });

  it('restores a day-aligned start-only range as a custom last_seen selection', () => {
    const result = parseViewConfigFilters({
      host: {
        last_check_in_start: moment('2026-07-29').startOf('day').toISOString(),
      },
    } as never);

    expect(result).toEqual({ last_seen: 'custom' });
  });

  it('restores a day-aligned end-only range as a custom last_seen selection', () => {
    const result = parseViewConfigFilters({
      host: {
        last_check_in_end: moment('2026-07-30').endOf('day').toISOString(),
      },
    } as never);

    expect(result).toEqual({ last_seen: 'custom' });
  });

  it('restores a single end bound as the closest relative preset', () => {
    const result = parseViewConfigFilters({
      host: {
        last_check_in_end: moment().subtract(15, 'days').toISOString(),
      },
    } as never);

    expect(result).toEqual({ last_seen: '15more' });
  });

  it('round-trips system_profile and host filters together', () => {
    const input: InventoryFilters = {
      operating_system: ['RHEL9.4'],
      workloads: ['sap'],
      rhcStatus: ['connected'],
      system_type: ['conventional'],
      hostname_or_id: 'prod-host',
      status: ['fresh'],
      source: ['puptoo', 'yupana'],
      tags: ['env/prod'],
      group_id: [],
      last_seen: '',
    };

    const built = buildViewConfigFilters(input);
    const parsed = parseViewConfigFilters(built as never);

    // Empty group_id and last_seen are not included in parsed result
    expect(parsed).toEqual({
      operating_system: ['RHEL9.4'],
      workloads: ['sap'],
      rhcStatus: ['connected'],
      system_type: ['conventional'],
      hostname_or_id: 'prod-host',
      status: ['fresh'],
      source: ['puptoo', 'yupana'],
      tags: ['env/prod'],
    });
  });

  it('round-trips through build and parse', () => {
    const input: InventoryFilters = {
      operating_system: ['RHEL9.4', 'CentOS Linux8.5'],
      workloads: ['sap'],
      rhcStatus: ['connected'],
      system_type: ['conventional', 'image'],
      hostname_or_id: '',
      status: [],
      source: [],
      tags: [],
      group_id: [],
      last_seen: '',
    };

    const built = buildViewConfigFilters(input);
    const parsed = parseViewConfigFilters(built as never);

    // Empty filters are not included in parsed result
    expect(parsed).toEqual({
      operating_system: ['RHEL9.4', 'CentOS Linux8.5'],
      workloads: ['sap'],
      rhcStatus: ['connected'],
      system_type: ['conventional', 'image'],
    });
  });
});

describe('parseViewConfigLastSeenCustomRange', () => {
  it('returns null when there are no filters or host date bounds', () => {
    expect(parseViewConfigLastSeenCustomRange(undefined)).toBeNull();
    expect(parseViewConfigLastSeenCustomRange({} as never)).toBeNull();
    expect(
      parseViewConfigLastSeenCustomRange({
        host: { hostname_or_id: 'x' },
      } as never),
    ).toBeNull();
  });

  it('extracts start and end bounds from a day-aligned two-sided range', () => {
    const start = moment('2026-07-29').startOf('day').toISOString();
    const end = moment('2026-07-30').endOf('day').toISOString();
    const result = parseViewConfigLastSeenCustomRange({
      host: { last_check_in_start: start, last_check_in_end: end },
    } as never);

    expect(result).toEqual({ start, end });
  });

  it('extracts a start-only bound from an open-ended custom range', () => {
    const start = moment('2026-07-29').startOf('day').toISOString();
    const result = parseViewConfigLastSeenCustomRange({
      host: { last_check_in_start: start },
    } as never);

    expect(result).toEqual({ start, end: undefined });
  });

  it('extracts an end-only bound from an open-ended custom range', () => {
    const end = moment('2026-07-30').endOf('day').toISOString();
    const result = parseViewConfigLastSeenCustomRange({
      host: { last_check_in_end: end },
    } as never);

    expect(result).toEqual({ start: undefined, end });
  });

  it('returns null for a single-bound preset range', () => {
    expect(
      parseViewConfigLastSeenCustomRange({
        host: {
          last_check_in_end: moment().subtract(15, 'days').toISOString(),
        },
      } as never),
    ).toBeNull();
  });

  it('returns null for a non-day-aligned last24 range', () => {
    expect(
      parseViewConfigLastSeenCustomRange({
        host: {
          last_check_in_start: '2026-07-29T13:24:11.000Z',
          last_check_in_end: '2026-07-30T13:24:11.000Z',
        },
      } as never),
    ).toBeNull();
  });

  it('round-trips a custom range built from a custom last_seen selection', () => {
    const start = moment('2026-07-29').startOf('day').toISOString();
    const end = moment('2026-07-30').endOf('day').toISOString();
    const built = buildViewConfigFilters(
      { ...EMPTY_FILTERS, last_seen: 'custom' },
      { start, end },
    );

    expect(parseViewConfigLastSeenCustomRange(built as never)).toEqual({
      start,
      end,
    });
    expect(parseViewConfigFilters(built as never)).toEqual({
      last_seen: 'custom',
    });
  });
});
