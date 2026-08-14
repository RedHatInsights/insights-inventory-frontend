import { useCallback, useState } from 'react';
import { appendGroupSelection, toOsFilterGroups } from './helpers';
import useFetchOperatingSystems from '../../Utilities/hooks/useFetchOperatingSystems';
import { OS_CHIP } from '../../Utilities/constants';

export const operatingSystemFilterState = { operatingSystemFilter: [] };
export const OPERATING_SYSTEM_FILTER = 'OPERATING_SYSTEM_FILTER';
export const operatingSystemFilterReducer = (_state, { type, payload }) => ({
  ...(type === OPERATING_SYSTEM_FILTER && {
    operatingSystemFilter: payload,
  }),
});

export const useOperatingSystemFilter = (
  [state, dispatch] = [operatingSystemFilterState],
  // TODO Get rid of all additional (unnecessary) parameters
  apiParams,
  hasAccess,
  showCentosVersions,
  fetchCustomOSes,
  axios,
) => {
  const [operatingSystemsStateValue, setStateValue] = useState({});
  const operatingSystemsValue = dispatch
    ? state.operatingSystemFilter
    : operatingSystemsStateValue;

  const { operatingSystems, operatingSystemsLoaded } = useFetchOperatingSystems(
    {
      apiParams: { ...apiParams, options: { axios } },
      hasAccess,
      showCentosVersions,
      fetchCustomOSes,
    },
  );

  const groups = toOsFilterGroups(operatingSystems, operatingSystemsLoaded);

  const setOsValue = useCallback(
    (payload) =>
      dispatch
        ? dispatch({ type: OPERATING_SYSTEM_FILTER, payload })
        : setStateValue(payload),
    [dispatch],
  );

  const setValue = useCallback(
    (newSelection) => {
      const fullSelection = appendGroupSelection(newSelection, groups);
      setOsValue(fullSelection);
    },
    [groups, setOsValue],
  );

  const handleMajorVersionToggle = useCallback(
    (groupValue) => {
      const wasFullySelected =
        operatingSystemsValue[groupValue]?.[groupValue] === true;

      if (wasFullySelected) {
        const { [groupValue]: _, ...rest } = operatingSystemsValue;
        setOsValue(rest);
      } else {
        const groupItems =
          groups.find((g) => g.value === groupValue)?.items || [];
        setOsValue({
          ...operatingSystemsValue,
          [groupValue]: {
            [groupValue]: true,
            ...Object.fromEntries(groupItems.map(({ value }) => [value, true])),
          },
        });
      }
    },
    [operatingSystemsValue, groups, setOsValue],
  );

  const filter = {
    label: 'Operating system',
    value: 'operating-system-filter',
    type: 'group',
    filterValues: {
      selected: operatingSystemsValue,
      groups,
      onChange: (_e, newSelection, _group, _item, groupValue, itemValue) => {
        if (groupValue && itemValue === groupValue) {
          handleMajorVersionToggle(groupValue);
        } else {
          setValue(newSelection);
        }
      },
    },
  };

  const chips = Object.values(operatingSystemsValue)
    .flatMap((selection) => Object.keys(selection || {}))
    .map((osVersionValue) =>
      groups
        .flatMap(({ items }) => items)
        .find(({ value }) => value === osVersionValue),
    )
    .filter((v) => !!v)
    .map(({ label: name, ...props }) => ({
      name,
      ...props,
    }));

  const chip =
    Object.values(operatingSystemsValue).length > 0
      ? [
          {
            category: 'Operating system',
            type: OS_CHIP,
            chips,
          },
        ]
      : [];

  return [filter, chip, operatingSystemsValue, setValue];
};
