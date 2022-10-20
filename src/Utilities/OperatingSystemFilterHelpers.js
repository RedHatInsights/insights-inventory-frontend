import set  from 'lodash/set';
import omit  from 'lodash/omit';
import mapValues  from 'lodash/mapValues';
import { coerce, compare, rcompare } from 'semver';
import { OS_CHIP } from './constants';

export const updateGroupSelectionIdentifier = (selection, major) =>
    // if every minor version is selected, then mark the group as selected
    set(selection, [major, major], Object.values({ ...selection[major] }).filter(v => v !== major).every(Boolean));

/** Takes an array of string versions `value` and returns an object in the format
 * required by ConditionalFilter component (group filter); */
export const toGroupSelection = (value = [], availableVersions) =>
    (availableVersions === undefined ? value : availableVersions).reduce(
        (acc, version) => {
            const [major] = version.split('.');
            set(acc, [major, version], value.includes(version));
            updateGroupSelectionIdentifier(acc, major);
            return acc;
        },
        {}
    );

export const compareVersions = (a, b, asc = true) =>
    asc ? compare(coerce(a), coerce(b)) : rcompare(coerce(a), coerce(b));

/** Extracts enabled OS filter values from ConditionalFilter-like object */
export const getSelectedOsFilterVersions = (selected = {}) =>
    Object.values(selected).reduce((acc, versions) => {
        Object.entries(versions).forEach(
            ([version, enabled]) =>
                enabled && version.match(/[0-9]+.[0-9]+/) && acc.push(version)
        );
        return acc;
    }, []);

export const groupOSFilterVersions = (versions = []) => {
    const groups = Object.entries(
        versions.reduce((prev, { label, value }) => {
            const major = value.split('.')[0];

            if (prev[major] === undefined) {
                prev[major] = {
                    groupSelectable: true, // without this flag, the group won't be rendered - behavior of ConditionalFilter
                    label: 'RHEL ' + major,
                    value: major,
                    type: 'checkbox',
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

export const buildOSFilterChip = (operatingSystemValue = {}, operatingSystems = []) => {
    const minors = getSelectedOsFilterVersions(operatingSystemValue);
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

export const onOSFilterChange = (event, selection, clickedGroup, clickedItem) => {
    const newSelection = Object.assign({}, selection);
    const value = newSelection[clickedGroup.value][clickedItem.value];
    const major = clickedGroup.value;

    if (clickedItem.value === major) {
        // group checkbox clicked => update all minor version selections
        newSelection[major] = mapValues(newSelection[major], () => value);
    } else {
        newSelection[major][major] = Object.values(omit(newSelection[major], major)).every(Boolean);
    }

    return newSelection;
};
