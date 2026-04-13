import { useState } from 'react';
import { WORKLOAD_FILTER_KEY, workloadOptions } from '../../Utilities/index';

export const workloadFilterState = { workloadFilter: [] };
export const WORKLOAD_FILTER = 'WORKLOAD_FILTER';
export const workloadFilterReducer = (_state, { type, payload }) => ({
  ...(type === WORKLOAD_FILTER && {
    workloadFilter: payload,
  }),
});

export const useWorkloadFilter = (
  [state, dispatch] = [workloadFilterState],
) => {
  let [workloadStateValue, setStateValue] = useState([]);

  const workloadValue = dispatch ? state.workloadFilter : workloadStateValue;

  const setValue = dispatch
    ? (newValue) => dispatch({ type: WORKLOAD_FILTER, payload: newValue })
    : setStateValue;

  const filter = {
    label: 'Workload',
    value: 'workloads',
    type: 'checkbox',
    filterValues: {
      value: workloadValue,
      onChange: (_e, value) => setValue(value),
      items: workloadOptions,
      placeholder: 'Filter by workload',
    },
  };

  const chip =
    workloadValue?.length > 0
      ? [
          {
            category: 'Workload',
            type: WORKLOAD_FILTER_KEY,
            chips: workloadOptions
              .filter(({ value }) => workloadValue.includes(value))
              .map(({ label, value }) => ({ name: label, value })),
          },
        ]
      : [];

  return [filter, chip, workloadValue, setValue];
};
