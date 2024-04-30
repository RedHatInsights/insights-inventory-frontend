import { calculateFilters } from './Utilities';

describe('calculateFilters', () => {
  it('should returns a mutated SearchParams for filters', () => {
    const searchParams = new URLSearchParams();

    expect(calculateFilters(searchParams, []).toString()).toEqual('');
  });

  it('should returns proper operating_system params when given an osFilter', () => {
    const searchParams = new URLSearchParams();
    const filtersWithSelectedOsVersions = [
      {
        osFilter: {
          'RHEL-9': {
            'RHEL-9': true,
            'RHEL-9-9.5': true,
            'RHEL-9-9.4': true,
            'RHEL-9-9.1': true,
            'RHEL-9-9.3': true,
            'RHEL-9-9.0': true,
            'RHEL-9-9.2': true,
          },
          'RHEL-7': {
            'RHEL-7': null,
            'RHEL-7-7.5': true,
            'RHEL-7-7.1': true,
            'RHEL-7-7.0': true,
          },
          'CentOS-Linux-7': {
            'CentOS-Linux-7': null,
            'CentOS-Linux-7-7.9': true,
          },
        },
      },
    ];

    expect(
      calculateFilters(searchParams, filtersWithSelectedOsVersions).getAll(
        'operating_system'
      )
    ).toEqual([
      'RHEL9.5',
      'RHEL9.4',
      'RHEL9.1',
      'RHEL9.3',
      'RHEL9.0',
      'RHEL9.2',
      'RHEL7.5',
      'RHEL7.1',
      'RHEL7.0',
      'CentOS Linux7.9',
    ]);
  });
});
