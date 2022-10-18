/* eslint-disable quote-props */
import { cloneDeep, set } from 'lodash';
import {
    toGroupSelection,
    buildOSFilterChip,
    compareVersions,
    getSelectedOsFilterVersions,
    groupOSFilterVersions,
    onOSFilterChange
} from './OperatingSystemFilterHelpers';

const testValue = {
    7: {
        '7': true,
        '7.0': true,
        '7.1': true,
        '7.2': true
    },
    8: {
        '8': true,
        '8.5': true,
        '8.10': true
    },
    9: {
        '9': true,
        '9.1': true
    }
};

const testVersions = [
    {
        label: 'RHEL 6.9',
        value: '6.9'
    },
    {
        label: 'RHEL 6.10',
        value: '6.10'
    },
    {
        label: 'RHEL 7.0',
        value: '7.0'
    },
    {
        label: 'RHEL 8.5',
        value: '8.5'
    },
    {
        label: 'RHEL 8.10',
        value: '8.10'
    }
];

describe('toGroupSelection', () => {
    it('returns a select value for an empty group selection', () => {
        expect(toGroupSelection([])).toEqual({});
    });

    it('returns a select value for a group selection', () => {
        expect(toGroupSelection(['7.0', '7.1', '7.2', '8.5', '8.10', '9.1'])).toEqual(testValue);
    });

    it('return a select value for a group selection with available version', () => {
        expect(toGroupSelection(['7.0', '7.1', '7.2', '8.5', '8.10', '9.1'], ['7.1', '7.2', '7.3', '8.5', '8.10'])).
        toEqual({
            7: {
                '7': false,
                '7.1': true,
                '7.2': true,
                '7.3': false
            },
            8: {
                '8': true,
                '8.5': true,
                '8.10': true
            }
        });
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
        const value = cloneDeep(testValue);
        value['8']['8.5'] = false;
        expect(getSelectedOsFilterVersions({})).toEqual([]);
        expect(getSelectedOsFilterVersions({ 7: { 7.1: false } })).toEqual([]);
        expect(getSelectedOsFilterVersions(value)).toEqual(['7.0', '7.1', '7.2', '8.10', '9.1']);
    });
});

describe('groupOSFilterVersions', () => {
    it('returns empty config for zero versions', () => {
        expect(groupOSFilterVersions([])).toEqual([]);
    });

    it('returns group configuration with 3 groups and 4 values', () => {
        const config = groupOSFilterVersions(testVersions);
        expect(config).toMatchSnapshot();
        expect(config[0].groupSelectable).toEqual(true);
        expect(config[0].label).toEqual('RHEL 8');
        expect(config[0].value).toEqual('8');
    });
});

describe('buildOSFilterChip', () => {
    it('returns two version chips', () => {
        const chips = buildOSFilterChip(testValue, testVersions);
        expect(chips).toMatchSnapshot();
        expect(chips[0].chips).toHaveLength(3);
    });
});

describe('onOSFilterChange', () => {
    const clickedGroup = {
        value: '8'
    };
    const clickedItem = {
        value: '8.5'
    };

    it('returns new selection with group selection enabled', () => {
        const selection = cloneDeep(testValue);
        set(selection, [8, 8], false);
        expect(onOSFilterChange(undefined, selection, clickedGroup, clickedItem)).toEqual(testValue);
    });

    it('returns new selection with group selection disabled', () => {
        const selection = cloneDeep(testValue);
        selection[8][8.10] = false;
        const expected = cloneDeep(selection);
        expected[8][8] = false;
        expect(onOSFilterChange(undefined, selection, clickedGroup, clickedItem)).toEqual(expected);
    });

    it('returns new selection with all minors selected after click on group', () => {
        const clickedItem = {
            value: '8'
        };
        const selection = cloneDeep(testValue);
        selection[8] = {
            '8': true,
            '8.5': false,
            '8.10': false
        };
        expect(onOSFilterChange(undefined, selection, clickedGroup, clickedItem)).toEqual(testValue);
    });

    it('returns new selection with all minors disabled after click on group', () => {
        const clickedItem = {
            value: '8'
        };
        const selection = cloneDeep(testValue);
        selection[8] = {
            '8': false,
            '8.5': true,
            '8.10': true
        };
        const expected = cloneDeep(testValue);
        expected[8] = {
            '8': false,
            '8.5': false,
            '8.10': false
        };
        expect(onOSFilterChange(undefined, selection, clickedGroup, clickedItem)).toEqual(expected);
    });
});
