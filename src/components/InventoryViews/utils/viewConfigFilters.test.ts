import { expect } from '@jest/globals';
import {
  buildViewConfigFilters,
  parseViewConfigFilters,
} from './viewConfigFilters';

const EMPTY_FILTERS = {
  operating_system: [],
  workloads: [],
  rhcStatus: [],
  system_type: [],
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

  it('includes rhcStatus as rhc_client_id', () => {
    const result = buildViewConfigFilters({
      ...EMPTY_FILTERS,
      rhcStatus: ['connected'],
    });

    expect(result).toEqual({
      system_profile: {
        rhc_client_id: ['connected'],
      },
    });
  });

  it('converts conventional system_type to host_type filter', () => {
    const result = buildViewConfigFilters({
      ...EMPTY_FILTERS,
      system_type: ['conventional'],
    });

    expect(result).toEqual({
      system_profile: {
        host_type: { eq: ['conventional'] },
      },
    });
  });

  it('expands image system_type to bootc and edge', () => {
    const result = buildViewConfigFilters({
      ...EMPTY_FILTERS,
      system_type: ['image'],
    });

    expect(result).toEqual({
      system_profile: {
        host_type: { eq: ['bootc', 'edge'] },
      },
    });
  });

  it('combines conventional and image system types', () => {
    const result = buildViewConfigFilters({
      ...EMPTY_FILTERS,
      system_type: ['conventional', 'image'],
    });

    expect(result).toEqual({
      system_profile: {
        host_type: { eq: ['conventional', 'bootc', 'edge'] },
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

  it('converts rhc_client_id back to rhcStatus', () => {
    const result = parseViewConfigFilters({
      system_profile: {
        rhc_client_id: ['connected'],
      },
    } as never);

    expect(result).toEqual({
      rhcStatus: ['connected'],
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

  it('round-trips through build and parse', () => {
    const input = {
      operating_system: ['RHEL9.4', 'CentOS Linux8.5'],
      workloads: ['sap'],
      rhcStatus: ['connected'],
      system_type: ['conventional', 'image'],
    };

    const built = buildViewConfigFilters(input);
    const parsed = parseViewConfigFilters(built as never);

    expect(parsed).toEqual(input);
  });
});
