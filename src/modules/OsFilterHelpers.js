import { compareVersions } from '../Utilities/OperatingSystemFilterHelpers';

export * from '../Utilities/OperatingSystemFilterHelpers';

/**
 * TODO: Deprecated, remove once no longer exposed through fed modules
 */
export const toGroupSelectionValue = (osVersions = []) => osVersions.reduce((acc, version) => {
    const [majorVersion, minorVersion] = version.split('.');
    acc[`${majorVersion}.0`] = {
        ...(acc[`${majorVersion}.0`] || {}),
        [`${majorVersion}.${minorVersion}`]: true
    };
    return acc;
}, {});

/**
 * TODO: Deprecated, remove once no longer exposed through fed modules
 */
const groupOSVersions = (versions) => {
    const groups = Object.entries(
        versions.reduce((prev, { label, value }) => {
            const major = value.split('.')[0];

            if (prev[major] === undefined) {
                prev[major] = {
                    groupSelectable: true, // without this flag, the group won't be rendered - behavior of ConditionalFilter
                    noFilter: true,
                    label: 'RHEL ' + major,
                    value: major + '.0',
                    items: []
                };
            }

            prev[major].items.push({
                label,
                value,
                type: 'checkbox'
            });

            return prev;
        }, {})
    );

    // sort by major versions in descending order
    groups.sort((a, b) => compareVersions(a[0], b[0], false));

    const sorted = groups.map((group) => {
        // sort minor versions under each group
        group[1].items.sort((a, b) => compareVersions(a.value, b.value, false));
        return group[1];
    });

    return sorted;
};

/**
 * TODO: Deprecated, remove once no longer exposed through fed modules
 */
export const buildOSFilterConfig = (config = {}, operatingSystems = []) => ({
    ...config,
    label: 'Operating System',
    value: 'os-filter',
    type: 'group',
    filterValues: {
        selected: config.value,
        onChange: (event, value) =>
            config.onChange(event, Object.entries(value).reduce((prev, cur) => {
                const [major, minors] = cur;
                // eliminate versions that are set to false
                return { ...prev, [major]: Object.fromEntries(Object.entries(minors).filter((version) => version[1] === true)) };
            }, {})),
        groups: operatingSystems.length === 0
            ? [{ items: [{ label: 'No versions available' }] }]
            : groupOSVersions(operatingSystems)
    }
});
