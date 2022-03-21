import { toGroupSelectionValue, buildOSFilterConfig, buildOSChip } from './OperatingSystemFilterHelpers';

describe('toGroupSelectionValue', () => {
    it('returns a select value for a group selection', () => {
        expect(toGroupSelectionValue(['7.0', '7.1', '7.2', '9.1', '8.5'])).toMatchSnapshot();
    });
});

describe('buildOSFilterConfig', function () {
    it('returns a filter configuration', () => {
        expect(buildOSFilterConfig()).toMatchSnapshot();
    });

    it('appends a given config', () => {
        expect(buildOSFilterConfig({
            filterValues: []
        })).toMatchSnapshot();
    });
});

describe('buildOSChip', function () {
    it('returnd chips', () => {
        expect(buildOSChip(['7.9'])).toMatchSnapshot();
    });
});
