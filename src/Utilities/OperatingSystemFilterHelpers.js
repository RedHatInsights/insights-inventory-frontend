import set from 'lodash/set';
import omit from 'lodash/omit';
import mapValues from 'lodash/mapValues';
import { coerce, compare, rcompare } from 'semver';
import { OS_CHIP } from './constants';

export const updateGroupSelectionIdentifier = (selection, groupLabel, major) =>
  // if every minor version is selected, then mark the group as selected
  set(
    selection,
    [groupLabel, major],
    Object.values({ ...selection[groupLabel] })
      .filter((v) => v !== major)
      .every(Boolean)
  );

const isVersionSelected = (selectedVersion, osVersion) => {
  for (let i = 0; i < selectedVersion.length; i++) {
    if (selectedVersion[i].value === osVersion.value) {
      return true;
    } else {
      continue;
    }
  }

  return false;
};

/** Takes an array of object versions `value` and returns an object in the format
 * required by ConditionalFilter component (group filter); */
export const toGroupSelection = (value = [], availableVersions) =>
  (availableVersions === undefined ? value : availableVersions).reduce(
    (acc, version) => {
      const { groupLabel, value } = version;
      const [major] = value.split('.');

      set(acc, [groupLabel, version.value], isVersionSelected(value, version));
      updateGroupSelectionIdentifier(acc, groupLabel, major);
      return acc;
    },
    {}
  );

export const compareVersions = (a, b, asc = true) =>
  asc ? compare(coerce(a), coerce(b)) : rcompare(coerce(a), coerce(b));

/** Extracts enabled OS filter values from ConditionalFilter-like object */
export const getSelectedOsFilterVersions = (selected = {}) =>
  Object.entries(selected).reduce((acc, [osGroup, versions]) => {
    Object.entries(versions).forEach(([version, enabled]) => {
      if (enabled && version.match(/[0-9]+.[0-9]+/)) {
        let osName = osGroup.split(' ').slice(0, -1).join(' ');
        acc.push({ osName, osGroup, value: version });
      }
    });
    return acc;
  }, []);

export const groupOSFilterVersions = (versions = []) => {
  const groups = Object.entries(
    versions.reduce((prev, { label, osName, value }) => {
      const major = value.split('.')[0];
      const group = `${osName} ${major}`;

      if (prev[group] === undefined) {
        prev[group] = {
          groupSelectable: true, // without this flag, the group won't be rendered - behavior of ConditionalFilter
          label: group,
          value: group,
          type: 'checkbox',
          items: [],
        };
      }

      prev[group].items.push({
        label,
        value,
        type: 'checkbox',
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

export const buildOSFilterChip = (
  operatingSystemValue = {},
  operatingSystems = []
) => {
  const minors = getSelectedOsFilterVersions(operatingSystemValue);
  let filteredMinors = operatingSystems.filter(({ groupLabel, value }) => {
    let minorsReturnedValue = minors.some(
      (minor) => minor.value === value && minor.osGroup === groupLabel
    );
    return minorsReturnedValue;
  });

  const chips = filteredMinors.map(({ label, ...props }) => ({
    name: label,
    ...props,
  }));

  return minors?.length > 0
    ? [
        {
          category: 'Operating System',
          type: OS_CHIP,
          chips,
        },
      ]
    : [];
};

export const onOSFilterChange = (
  event,
  selection,
  clickedGroup,
  clickedItem
) => {
  const newSelection = Object.assign({}, selection);
  const value = newSelection[clickedGroup.value][clickedItem.value];
  const group = clickedGroup.value;

  if (clickedItem.value === clickedGroup.value) {
    // group checkbox clicked => update all minor version selections
    newSelection[group] = mapValues(newSelection[group], () => value);
  } else {
    newSelection[group][group] = Object.values(
      omit(newSelection[group], [group])
    ).every(Boolean);
  }

  return newSelection;
};
