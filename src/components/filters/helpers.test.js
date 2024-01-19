import moment from 'moment';
import { buildOperatingSystems } from '../../__factories__/operatingSystems';
import {
  appendGroupSelection,
  fromValidator,
  toOsFilterGroups,
  toValidator,
} from './helpers';

describe('Validates datepicker dates', () => {
  it('ToValidator', () => {
    const startOfToday = moment().startOf('day');
    const endOfToday = moment().endOf('day');
    expect(toValidator(startOfToday)(endOfToday)).toEqual('');
  });
  it('FromValidator', () => {
    const startOfToday = moment().startOf('day');
    const endOfToday = moment().endOf('day');
    expect(fromValidator(endOfToday)(startOfToday)).toEqual('');
  });
});

describe('toOsFilterGroups', () => {
  it('return "No versions available" when OSes are not loaded', () => {
    const operatingSystems = [];
    const operatingSystemsLoaded = false;
    expect(toOsFilterGroups(operatingSystems, operatingSystemsLoaded)).toEqual([
      { items: [{ isDisabled: true, label: 'No versions available' }] },
    ]);
  });

  it('returns ... when OSes are loaded', () => {
    const operatingSystems = [
      ...buildOperatingSystems(20, { osName: 'RHEL', major: 7 }),
      ...buildOperatingSystems(20, { osName: 'RHEL', major: 8 }),
      ...buildOperatingSystems(20, { osName: 'RHEL', major: 9 }),
      ...buildOperatingSystems(20, { osName: 'CentOS Linux', major: 7 }),
      ...buildOperatingSystems(20, { osName: 'CentOS Linux', major: 8 }),
    ];
    const operatingSystemsLoaded = true;
    expect(
      toOsFilterGroups(operatingSystems, operatingSystemsLoaded)
    ).toMatchSnapshot();
  });
});

describe('appendGroupSelection', () => {
  const operatingSystemsGroups = toOsFilterGroups(
    [
      ...buildOperatingSystems(10, { osName: 'RHEL', major: 7 }),
      ...buildOperatingSystems(10, { osName: 'RHEL', major: 8 }),
      ...buildOperatingSystems(5, { osName: 'RHEL', major: 9 }),
      ...buildOperatingSystems(10, { osName: 'CentOS Linux', major: 7 }),
      ...buildOperatingSystems(10, { osName: 'CentOS Linux', major: 8 }),
      ...buildOperatingSystems(5, { osName: 'CentOS', major: 9 }),
      ...buildOperatingSystems(4, { osName: 'Alma Linux', major: 8 }),
    ],
    true
  );

  it('returns a new selection', () => {
    const selection = {
      'RHEL-8': {
        'RHEL-8-8.8': true,
        'RHEL-8-8.7': true,
      },
      'RHEL-7': {
        'RHEL-7-7.8': true,
        'RHEL-7': null,
        'RHEL-7-7.7': false,
      },
      'CentOS-Linux-7': {
        'CentOS-Linux-7-7.8': true,
        'CentOS-Linux-7': true,
        'CentOS-Linux-7-7.7': false,
      },
      'Alma-Linux-7': {
        'Alma-Linux-7-7.1': true,
        'Alma-Linux-7': false,
      },
    };

    expect(
      appendGroupSelection(selection, operatingSystemsGroups)['RHEL-8'][
        'RHEL-8'
      ]
    ).toEqual(null);

    expect(
      appendGroupSelection(selection, operatingSystemsGroups)['RHEL-7'][
        'RHEL-7-7.7'
      ]
    ).toEqual(undefined);

    expect(
      Object.keys(
        appendGroupSelection(selection, operatingSystemsGroups)[
          'CentOS-Linux-7'
        ]
      ).length
    ).toEqual(11);

    expect(
      appendGroupSelection(selection, operatingSystemsGroups)['CentOS-Linux-7'][
        'CentOS-Linux-7-7.7'
      ]
    ).toEqual(true);

    expect(
      appendGroupSelection(selection, operatingSystemsGroups)['Alma-Linux-7']
    ).toBe(undefined);
  });

  it('returns a new selection with whole group appended', () => {
    const selection = {
      'RHEL-8': {
        'RHEL-8': true,
      },
    };

    expect(
      Object.keys(
        appendGroupSelection(selection, operatingSystemsGroups)['RHEL-8']
      ).length
    ).toEqual(11);
  });

  it('returns a new selection with whole group removed', () => {
    const selection = {
      'RHEL-8': {
        'RHEL-8': false,
        'RHEL-8-8.8': true,
        'RHEL-8-8.9': true,
        'RHEL-8-8.7': true,
      },
    };

    expect(appendGroupSelection(selection, operatingSystemsGroups)).toEqual({});
  });
});
