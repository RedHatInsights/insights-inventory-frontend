/* eslint-disable quote-props */
import { cloneDeep } from 'lodash';
import {
  buildOSFilterChip,
  compareVersions,
  getSelectedOsFilterVersions,
  groupOSFilterVersions,
  onOSFilterChange,
  toGroupSelection,
} from './OperatingSystemFilterHelpers';
import {
  availableVersions,
  groupSelection1,
  groupSelection2,
  testValue1,
  testValue2,
  testValue3,
  testValue4,
} from './__mocks__/OperatingSystemFilterHelpers.fixtures';

describe('toGroupSelection', () => {
  it('returns a select value for an empty group selection', () => {
    expect(toGroupSelection([])).toEqual({});
  });

  it('returns a select value for a group selection', () => {
    expect(toGroupSelection(groupSelection1)).toEqual(testValue1);
  });

  it('return a select value for a group selection with available version', () => {
    expect(toGroupSelection(groupSelection2, availableVersions)).toEqual(
      testValue2
    );
  });
});

describe('compareVersions', () => {
  it('returns correct comparison result asc', () => {
    expect(compareVersions('8.5', '8.6')).toEqual(-1);
    expect(compareVersions('7.0', '8.6')).toEqual(-1);
    expect(compareVersions('8.6', '8.6')).toEqual(0);
    expect(compareVersions('8.6', '8.5')).toEqual(1);
    expect(compareVersions('9.0', '8.6')).toEqual(1);
  });

  it('returns correct comparison result desc', () => {
    expect(compareVersions('8.5', '8.6', false)).toEqual(1);
  });
});

describe('getSelectedOsFilterVersions', () => {
  it('returns only enabled filter values', () => {
    const value = cloneDeep(testValue2);
    expect(getSelectedOsFilterVersions({})).toEqual([]);
    expect(getSelectedOsFilterVersions({ 'RHEL 7': { 7.1: false } })).toEqual(
      []
    );
    expect(getSelectedOsFilterVersions(value)).toEqual(groupSelection2);
  });
});

describe('groupOSFilterVersions', () => {
  it('returns empty config for zero versions', () => {
    expect(groupOSFilterVersions([])).toEqual([]);
  });

  it('returns group configuration with 5 groups', () => {
    const config = groupOSFilterVersions(availableVersions);
    expect(config).toMatchSnapshot();
    expect(config[0].groupSelectable).toEqual(true);
    expect(config[0].label).toEqual('RHEL 8');
    expect(config[0].value).toEqual('RHEL 8');
  });
});

describe('buildOSFilterChip', () => {
  it('returns five version chips', () => {
    const chips = buildOSFilterChip(testValue2, availableVersions);
    expect(chips).toMatchSnapshot();
    expect(chips[0].chips).toHaveLength(5);
  });
});

describe('onOSFilterChange', () => {
  const clickedGroup = {
    value: 'RHEL 8',
  };
  const clickedItem = {
    value: '8.10',
  };

  it('returns new selection with group selection enabled', () => {
    const selection = cloneDeep(testValue3);
    selection['RHEL 8'] = {
      8.5: true,
      '8.10': true,
    };
    expect(
      onOSFilterChange(undefined, selection, clickedGroup, clickedItem)
    ).toEqual(testValue4);
  });

  it('returns new selection with group selection disabled', () => {
    const selection = cloneDeep(testValue4);
    selection['RHEL 8'] = {
      8.5: false,
      '8.10': false,
    };
    expect(
      onOSFilterChange(undefined, selection, clickedGroup, clickedItem)
    ).toEqual(testValue3);
  });

  it('returns new selection with all minors selected after click on group', () => {
    const clickedItem = {
      value: 'RHEL 8',
    };
    const selection = cloneDeep(testValue3);
    selection['RHEL 8'] = {
      'RHEL 8': true,
      8.5: false,
      '8.10': false,
    };
    expect(
      onOSFilterChange(undefined, selection, clickedGroup, clickedItem)
    ).toEqual(testValue4);
  });

  it('returns new selection with all minors disabled after click on group', () => {
    const clickedItem = {
      value: 'RHEL 8',
    };
    const selection = cloneDeep(testValue4);
    selection['RHEL 8'] = {
      'RHEL 8': false,
      8.5: true,
      '8.10': true,
    };
    expect(
      onOSFilterChange(undefined, selection, clickedGroup, clickedItem)
    ).toEqual(testValue3);
  });
});
