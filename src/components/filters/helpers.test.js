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

    expect(toOsFilterGroups(operatingSystems, false)).toEqual([
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

    expect(toOsFilterGroups(operatingSystems, true)).toMatchSnapshot();
  });

  it('returns os versions ordered descending', () => {
    const operatingSystems = [
      ...buildOperatingSystems(5, { osName: 'RHEL', major: 7 }),
    ];
    const filterGroups = toOsFilterGroups(operatingSystems, true)[0];

    expect(filterGroups.items[0].minor).toEqual(4);
    expect(filterGroups.items[filterGroups.items.length - 1].minor).toEqual(0);
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
      },
      'Alma-Linux-8': {
        'Alma-Linux-8-8.1': true,
        'Alma-Linux-8': false,
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
    console.log(
      appendGroupSelection(selection, operatingSystemsGroups)['Alma-Linux-8']
    );
    expect(
      appendGroupSelection(selection, operatingSystemsGroups)['Alma-Linux-8']
    ).toEqual({ 'Alma-Linux-8': null, 'Alma-Linux-8-8.1': true });
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

  it('returns a new selection with whole group removed only if the whole group is present already', () => {
    const selection = {
      'RHEL-8': {
        'RHEL-8': false,
        'RHEL-8-8.0': true,
        'RHEL-8-8.1': true,
        'RHEL-8-8.2': true,
        'RHEL-8-8.3': true,
        'RHEL-8-8.4': true,
        'RHEL-8-8.5': true,
        'RHEL-8-8.6': true,
        'RHEL-8-8.7': true,
        'RHEL-8-8.8': true,
        'RHEL-8-8.9': true,
      },
    };

    expect(appendGroupSelection(selection, operatingSystemsGroups)).toEqual({});
  });

  it('it allows deselecting a minor version even when major is set to true (which actually should be null)', () => {
    const selection = {
      'RHEL-8': {
        'RHEL-8': true,
        'RHEL-8-8.0': true,
        'RHEL-8-8.1': true,
        'RHEL-8-8.2': true,
        'RHEL-8-8.3': true,
        'RHEL-8-8.4': true,
        'RHEL-8-8.5': true,
        'RHEL-8-8.6': true,
        'RHEL-8-8.7': true,
        'RHEL-8-8.8': false,
        'RHEL-8-8.9': true,
      },
    };

    expect(appendGroupSelection(selection, operatingSystemsGroups)).toEqual({
      'RHEL-8': {
        'RHEL-8': null,
        'RHEL-8-8.0': true,
        'RHEL-8-8.1': true,
        'RHEL-8-8.2': true,
        'RHEL-8-8.3': true,
        'RHEL-8-8.4': true,
        'RHEL-8-8.5': true,
        'RHEL-8-8.6': true,
        'RHEL-8-8.7': true,
        'RHEL-8-8.9': true,
      },
    });
  });

  it('it allows deselecting a minor version even when major is set to true (which actually should be null)', () => {
    const selection = {
      'RHEL-8': {
        'RHEL-8-8.0': true,
        'RHEL-8-8.1': true,
        'RHEL-8-8.2': true,
        'RHEL-8-8.3': true,
        'RHEL-8-8.4': true,
        'RHEL-8-8.5': true,
        'RHEL-8-8.6': true,
        'RHEL-8-8.7': true,
        'RHEL-8-8.8': true,
        'RHEL-8-8.9': true,
      },
    };

    expect(appendGroupSelection(selection, operatingSystemsGroups)).toEqual({
      'RHEL-8': {
        'RHEL-8': true,
        'RHEL-8-8.0': true,
        'RHEL-8-8.1': true,
        'RHEL-8-8.2': true,
        'RHEL-8-8.3': true,
        'RHEL-8-8.4': true,
        'RHEL-8-8.5': true,
        'RHEL-8-8.6': true,
        'RHEL-8-8.7': true,
        'RHEL-8-8.8': true,
        'RHEL-8-8.9': true,
      },
    });
  });
});
