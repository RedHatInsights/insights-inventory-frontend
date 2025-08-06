import { useMemo, useState } from 'react';
import { SYSTEM_TYPE_KEY, systemTypeOptions } from '../../Utilities/index';

export const systemTypeFilterState = { systemTypeFilter: [] };
export const SYSTEM_TYPE_FILTER = 'SYSTEM_TYPE_FILTER';

export const systemTypeFilterReducer = (_state, { type, payload }) => ({
  ...(type === SYSTEM_TYPE_FILTER && {
    systemTypeFilter: payload,
  }),
});

export const useSystemTypeFilter = (
  [state, dispatch] = [systemTypeFilterState],
) => {
  const [filterStateValue, setStateValue] = useState([]);
  const systemTypeValue = dispatch ? state.systemTypeFilter : filterStateValue;

  const getExpandedSystemTypeValues = useMemo(
    () => (selectedValues) => {
      if (!Array.isArray(selectedValues)) return [];
      return selectedValues.flatMap((selected) => {
        const match = systemTypeOptions.find((opt) => opt.value === selected);
        return match?.packageBasedValues
          ? match.packageBasedValues
          : match?.imageBasedValues
            ? match.imageBasedValues
            : [];
      });
    },
    [],
  );
  const selectedSystemTypeLabels = useMemo(() => {
    if (!Array.isArray(systemTypeValue)) {
      return [];
    }
    return systemTypeOptions.filter(
      ({ packageBasedValues = [], imageBasedValues = [] }) => {
        const allOptionValues = [...packageBasedValues, ...imageBasedValues];
        return allOptionValues.some((val) => systemTypeValue.includes(val));
      },
    );
  }, [systemTypeValue]);

  const setValue = dispatch
    ? (newValue) =>
        dispatch({
          type: SYSTEM_TYPE_FILTER,
          payload: getExpandedSystemTypeValues(newValue),
        })
    : (newValue) => setStateValue(getExpandedSystemTypeValues(newValue));

  const filter = {
    label: 'System type',
    value: 'not_nil',
    type: 'checkbox',
    filterValues: {
      value: selectedSystemTypeLabels.map(({ value }) => value),
      onChange: (_e, value) => setValue(value || []),
      items: systemTypeOptions,
    },
  };

  const chip =
    systemTypeValue?.length > 0
      ? [
          {
            category: 'System type',
            type: SYSTEM_TYPE_KEY,
            chips: selectedSystemTypeLabels.map(({ label, value }) => ({
              name: label,
              value,
            })),
          },
        ]
      : [];
  return [filter, chip, systemTypeValue, setValue];
};
