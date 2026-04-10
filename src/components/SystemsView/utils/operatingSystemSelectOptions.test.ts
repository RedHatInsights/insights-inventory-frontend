import { expect } from '@jest/globals';
import '@testing-library/jest-dom';
import type { OperatingSystemVersionRow } from './operatingSystemSelectOptions';
import {
  buildOperatingSystemProfileFilter,
  getOsSelectOptions,
  mapOperatingSystemApiResultsToVersionRows,
  osVersionSorter,
} from './operatingSystemSelectOptions';

describe('mapOperatingSystemApiResultsToVersionRows', () => {
  it('returns empty array for undefined or empty results', () => {
    expect(mapOperatingSystemApiResultsToVersionRows(undefined)).toEqual([]);
    expect(mapOperatingSystemApiResultsToVersionRows([])).toEqual([]);
  });

  it('maps valid rows and skips incomplete values', () => {
    expect(
      mapOperatingSystemApiResultsToVersionRows([
        { value: { name: 'RHEL', major: 9, minor: 0 }, count: 1 },
        { value: { name: 'RHEL', major: null, minor: 0 }, count: 0 },
        { value: undefined, count: 0 },
      ]),
    ).toEqual([{ name: 'RHEL', major: 9, minor: 0 }]);
  });
});

describe('osVersionSorter', () => {
  it('sorts by major then minor descending', () => {
    const a: OperatingSystemVersionRow = {
      name: 'RHEL',
      major: 8,
      minor: 4,
    };
    const b: OperatingSystemVersionRow = {
      name: 'RHEL',
      major: 9,
      minor: 0,
    };
    const c: OperatingSystemVersionRow = {
      name: 'RHEL',
      major: 8,
      minor: 10,
    };
    expect(
      [a, b, c].sort(osVersionSorter).map((x) => `${x.major}.${x.minor}`),
    ).toEqual(['9.0', '8.10', '8.4']);
  });
});

describe('buildOperatingSystemProfileFilter', () => {
  it('returns undefined for empty or undefined input', () => {
    expect(buildOperatingSystemProfileFilter(undefined)).toBeUndefined();
    expect(buildOperatingSystemProfileFilter([])).toBeUndefined();
  });

  it('groups tokens by OS name and dedupes versions', () => {
    expect(
      buildOperatingSystemProfileFilter([
        'RHEL:9.0',
        'RHEL:8.4',
        'RHEL:9.0',
        'CentOS Linux:7.9',
      ]),
    ).toEqual({
      RHEL: { version: { eq: ['9.0', '8.4'] } },
      'CentOS Linux': { version: { eq: ['7.9'] } },
    });
  });

  it('skips malformed tokens', () => {
    expect(
      buildOperatingSystemProfileFilter(['nocolon', ':onlyversion', 'OK:1.0']),
    ).toEqual({
      OK: { version: { eq: ['1.0'] } },
    });
  });
});

describe('getOsSelectOptions', () => {
  it('returns empty array when osData is nullish', () => {
    expect(getOsSelectOptions('RHEL', undefined)).toEqual([]);
    expect(getOsSelectOptions('RHEL', null)).toEqual([]);
  });

  it('groups by major and sorts versions', () => {
    const rows: OperatingSystemVersionRow[] = [
      { name: 'RHEL', major: 8, minor: 4 },
      { name: 'RHEL', major: 8, minor: 10 },
      { name: 'RHEL', major: 9, minor: 0 },
      { name: 'CentOS Linux', major: 7, minor: 9 },
    ];
    const rhel = getOsSelectOptions('RHEL', rows);
    expect(rhel).toHaveLength(2);
    expect(rhel[0].label).toBe('RHEL 9');
    expect(rhel[0].items.map((i) => i.value)).toEqual(['9.0']);
    expect(rhel[1].label).toBe('RHEL 8');
    expect(rhel[1].items.map((i) => i.value)).toEqual(['8.10', '8.4']);
    expect(getOsSelectOptions('CentOS Linux', rows)).toEqual([
      expect.objectContaining({
        label: 'CentOS Linux 7',
        value: 'CentOS Linux',
        items: [{ label: 'CentOS Linux 7.9', value: '7.9' }],
      }),
    ]);
  });
});
