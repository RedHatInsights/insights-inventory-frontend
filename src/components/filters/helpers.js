import moment from 'moment';

export const oldestDate = new Date(1970, 1, 1);
//validators control what date ranges can be selected in the component.
//both validators need to keep in mind todays date, and the other components inputed date.

//maxDate is the other date pickers currently selected Date
//date is patternfly component date
export const fromValidator = (maxDate) => (date) => {
  const todaysDate = moment().startOf('day');
  const newMaxDate = moment(maxDate).startOf('day');

  if (date < oldestDate) {
    return 'Date is before the allowable range.';
  } else if (date > newMaxDate) {
    return `End date must be later than Start date.`;
  } else if (date > todaysDate) {
    return ' Start date must be earlier than End date.';
  } else {
    return '';
  }
};

//minDate is the other components currently selected Date
//dateToValidate is patternfly component date.
export const toValidator = (minDate) => (dateToValidate) => {
  const todaysDate = moment().endOf('day');
  const newDatetoValidate = new Date(dateToValidate);
  const newMinDate = moment(minDate).startOf('day');

  if (newDatetoValidate < newMinDate) {
    return 'Start date must be earlier than End date.';
  } else if (newDatetoValidate > todaysDate) {
    return `Date must be ${todaysDate.toISOString().split('T')[0]} or earlier`;
  } else {
    return '';
  }
};

export const containsSpecialChars = (str) => {
  // eslint-disable-next-line no-useless-escape
  const specialChars = /[`!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?~]/;
  return specialChars.test(str);
};

const filterGroup = (groupName, groupKey) => ({
  groupSelectable: true,
  label: groupName,
  value: groupKey,
  type: 'checkbox',
  items: [],
});

const filterGroupItem = (groupKey, name, major, minor) => ({
  type: 'checkbox',
  label: `${name} ${major}.${minor}`,
  value: `${groupKey}-${major}.${minor}`,
  major,
  minor,
  groupKey,
});

const getSortable = (property, item) => {
  if (typeof property === 'function') {
    return property(item);
  } else {
    return item[property];
  }
};

export const orderArrayByProp = (property, objects, direction) => {
  const sorted = objects.sort((a, b) => {
    return String(getSortable(property, a))
      .toLowerCase()
      .localeCompare(
        String(getSortable(property, b)).toLowerCase(),
        {},
        { numeric: true }
      );
  });

  if (direction === 'asc') {
    return sorted;
  } else {
    return sorted.reverse();
  }
};

export const toOsFilterGroups = (
  operatingSystems = [],
  operatingSystemsLoaded
) => {
  if (operatingSystems.length === 0 || !operatingSystemsLoaded) {
    return [{ items: [{ isDisabled: true, label: 'No versions available' }] }];
  } else {
    return orderArrayByProp(
      'major',
      Object.values(
        operatingSystems.reduce((groups, { value: { name, major, minor } }) => {
          const groupName = [name, major].join(' ');
          const groupKey = groupName.split(' ').join('-');

          if (!groups[groupKey]) {
            groups[groupKey] = filterGroup(groupName, groupKey);
          }
          const item = filterGroupItem(groupKey, name, major, minor);

          return {
            ...groups,
            [groupKey]: {
              ...groups[groupKey],
              major,
              items: [...groups[groupKey].items, item],
            },
          };
        }, {})
      ).map(({ items, ...rest }) => ({
        ...rest,
        items: orderArrayByProp('minor', items, 'desc'),
      })),
      'desc'
    );
  }
};

const makeGroupSelection = (groupKey, groupSelection, groupItemItems) => {
  if (groupSelection[groupKey] === false) {
    return [];
  } else {
    return [
      groupKey,
      {
        [groupKey]: true,
        ...Object.fromEntries(groupItemItems.map(({ value }) => [value, true])),
      },
    ];
  }
};

export const appendGroupSelection = (selection = {}, groups) =>
  Object.fromEntries(
    Object.entries(selection)
      .map(([groupKey, groupSelection]) => {
        const groupItemItems = groups.find(
          ({ value }) => value === groupKey
        )?.items;
        const selectedGroupItems = Object.fromEntries(
          Object.entries(groupSelection).filter(([osKey]) => {
            return osKey !== groupKey;
          })
        );
        const appendGroup =
          Object.keys(selectedGroupItems).length < groupItemItems?.length &&
          groupSelection[groupKey] === true;

        const removeGroup =
          Object.keys(selectedGroupItems).length === groupItemItems?.length &&
          groupSelection[groupKey] === false;

        if (appendGroup) {
          return makeGroupSelection(groupKey, groupSelection, groupItemItems);
        } else if (removeGroup) {
          return [];
        } else {
          const selectedMinor = Object.fromEntries(
            Object.entries(selectedGroupItems).filter(([, v]) => v !== false)
          );

          return [
            groupKey,
            {
              // FIXME (In conditional/group filter component) This returns either null or true
              // If some but not all are selected it should be "null", if all are selected "true"
              // However, due to a bug in the GroupFilter component the null gets cast to a Boolean, but it should not
              [groupKey]:
                Object.keys(selectedMinor).length === groupItemItems?.length
                  ? true
                  : null,
              ...selectedMinor,
            },
          ];
        }
      })
      .filter(([k, v]) => !!k && !!v)
  );
