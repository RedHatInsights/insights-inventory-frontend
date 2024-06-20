import { useState } from 'react';
import {
  SYSTEM_TYPE_KEY,
  systemTypeOptions as defaultSystemTypeOptions,
} from '../../Utilities/index';

export const systemTypeFilterState = { systemTypeFilter: [] };
export const SYSTEM_TYPE_FILTER = 'SYSTEM_TYPE_FILTER';
export const systemTypeFilterReducer = (_state, { type, payload }) => ({
  ...(type === SYSTEM_TYPE_FILTER && {
    systemTypeFilter: payload,
  }),
});

export const useSystemTypeFilter = (
  [state, dispatch] = [systemTypeFilterState]
) => {
  let [filterStateValue, setStateValue] = useState([]);
  const systemTypeValue = dispatch ? state.systemTypeFilter : filterStateValue;
  const setValue = dispatch
    ? (newValue) => dispatch({ type: SYSTEM_TYPE_FILTER, payload: newValue })
    : setStateValue;

  const filter = {
    label: 'System type',
    value: 'not_nil',
    type: 'checkbox',
    filterValues: {
      value: systemTypeValue,
      onChange: (_e, value) => setValue(value),
      items: defaultSystemTypeOptions,
    },
  };

  const chip =
    systemTypeValue?.length > 0
      ? [
          {
            category: 'System type',
            type: SYSTEM_TYPE_KEY,
            chips: defaultSystemTypeOptions
              .filter(({ value }) => systemTypeValue.includes(value))
              .map(({ label, ...props }) => ({ name: label, ...props })),
          },
        ]
      : [];

  return [filter, chip, systemTypeValue, setValue];
};
