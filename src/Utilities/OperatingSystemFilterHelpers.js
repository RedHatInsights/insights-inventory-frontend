import { coerce, compare, rcompare } from 'semver';
import { OS_CHIP } from './index';

/* Takes an array of string versions and returns an object in the format
   required by ConditionalFilter component (group filter) */
export const toGroupSelectionValue = (osVersions = []) => osVersions.reduce((acc, version) => {
    const [majorVersion, minorVersion] = version.split('.');
    acc[`${majorVersion}.0`] = {
        ...(acc[`${majorVersion}.0`] || {}),
        [`${majorVersion}.${minorVersion}`]: true
    };
    return acc;
}, {});

const compareVersions = (a, b, asc = true) =>
    asc ? compare(coerce(a), coerce(b)) : rcompare(coerce(a), coerce(b));

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
        groups: groupOSVersions(operatingSystems)
    }
});

export const buildOSChip = (operatingSystemValue = {}, operatingSystems) => {
    const minors = Object.values(operatingSystemValue).flatMap((group) =>
        Object.entries(group)
        .filter(([, isActive]) => isActive === true)
        .map(([version]) => version)
    );
    const chips = operatingSystems
    .filter(({ value }) => minors.includes(value))
    .map(({ label, ...props }) => ({ name: label, ...props }));

    return minors?.length > 0
        ? [
            {
                category: 'Operating System',
                type: OS_CHIP,
                chips
            }
        ]
        : [];
};
