import { toGroupSelectionValue, buildOSFilterConfig, buildOSChip } from './OperatingSystemFilterHelpers';

describe('toGroupSelectionValue', () => {
    it('returns a select value for a group selection', () => {
        expect(toGroupSelectionValue(['7.0', '7.1', '7.2', '9.1', '8.5'])).toMatchSnapshot();
    });
});

describe('buildOSFilterConfig', function () {
    it('returns a filter configuration', () => {
        expect(buildOSFilterConfig({}, [
            {
                label: 'RHEL 8.0',
                value: '8.0'
            },
            {
                label: 'RHEL 8.4',
                value: '8.4'
            },
            {
                label: 'RHEL 8.3',
                value: '8.3'
            },
            {
                label: 'RHEL 9.0',
                value: '9.0'
            }
        ])).toMatchSnapshot();
    });

    it('appends a given config', () => {
        expect(buildOSFilterConfig({
            filterValues: []
        }, [
            {
                label: 'RHEL 8.0',
                value: '8.0'
            },
            {
                label: 'RHEL 8.4',
                value: '8.4'
            },
            {
                label: 'RHEL 8.3',
                value: '8.3'
            },
            {
                label: 'RHEL 9.0',
                value: '9.0'
            }
        ])).toMatchSnapshot();
    });
});

describe('buildOSChip', function () {
    it('returnd chips', () => {
        expect(buildOSChip(['8.4'], [
            {
                label: 'RHEL 8.0',
                value: '8.0'
            },
            {
                label: 'RHEL 8.4',
                value: '8.4'
            },
            {
                label: 'RHEL 8.3',
                value: '8.3'
            },
            {
                label: 'RHEL 9.0',
                value: '9.0'
            }
        ])).toMatchSnapshot();
    });
});
