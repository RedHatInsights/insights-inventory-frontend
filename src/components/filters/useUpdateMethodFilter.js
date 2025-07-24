import { useState } from 'react';
import {
  UPDATE_METHOD_KEY,
  updateMethodOptions as defaultUpdateMethodOptions,
} from '../../Utilities/index';

export const updateMethodFilterState = { updateMethodFilter: [] };
export const UPDATE_METHOD_FILTER = 'UPDATE_METHOD_FILTER';
export const updateMethodFilterReducer = (_state, { type, payload }) => ({
  ...(type === UPDATE_METHOD_FILTER && {
    updateMethodFilter: payload,
  }),
});

export const useUpdateMethodFilter = (
  [state, dispatch] = [updateMethodFilterState],
) => {
  let [filterStateValue, setStateValue] = useState([]);
  const updateMethodValue = dispatch
    ? state.updateMethodFilter
    : filterStateValue;
  const setValue = dispatch
    ? (newValue) => dispatch({ type: UPDATE_METHOD_FILTER, payload: newValue })
    : setStateValue;

  const filter = {
    label: 'System Update Method',
    value: 'update-method',
    type: 'checkbox',
    filterValues: {
      value: updateMethodValue,
      onChange: (_e, value) => setValue(value),
      items: defaultUpdateMethodOptions,
    },
  };
  const chip =
    updateMethodValue?.length > 0
      ? [
          {
            category: 'System Update Method',
            type: UPDATE_METHOD_KEY,
            chips: defaultUpdateMethodOptions
              .filter(({ value }) => updateMethodValue.includes(value))
              .map(({ label, ...props }) => ({ name: label, ...props })),
          },
        ]
      : [];
  return [filter, chip, updateMethodValue, setValue];
};
