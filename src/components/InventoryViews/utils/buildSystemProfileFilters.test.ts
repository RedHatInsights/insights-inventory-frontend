import { expect } from '@jest/globals';
import { buildSystemProfileFilters } from './buildSystemProfileFilters';

const NOT_NIL = { is: 'not_nil' as const };

describe('buildSystemProfileFilters', () => {
  it('returns undefined when no profile filters are set', () => {
    expect(
      buildSystemProfileFilters({
        operating_system: [],
        workloads: [],
      }),
    ).toBeUndefined();
  });

  it('includes operating_system when OS tokens are selected', () => {
    expect(
      buildSystemProfileFilters({
        operating_system: ['RHEL9.0'],
        workloads: [],
      }),
    ).toEqual({
      operating_system: {
        RHEL: { version: { eq: ['9.0'] } },
      },
    });
  });

  it('includes workloads when workload keys are selected', () => {
    expect(
      buildSystemProfileFilters({
        operating_system: [],
        workloads: ['sap', 'ansible'],
      }),
    ).toEqual({
      workloads: {
        sap: NOT_NIL,
        ansible: NOT_NIL,
      },
    });
  });

  it('includes all filters when all are selected', () => {
    expect(
      buildSystemProfileFilters({
        operating_system: ['RHEL9.0'],
        workloads: ['sap'],
      }),
    ).toEqual({
      operating_system: {
        RHEL: { version: { eq: ['9.0'] } },
      },
      workloads: {
        sap: NOT_NIL,
      },
    });
  });
});
