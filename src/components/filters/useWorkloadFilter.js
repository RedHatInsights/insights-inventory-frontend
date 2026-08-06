import { useState } from 'react';
import { WORKLOAD_FILTER_KEY, workloadOptions } from '../../Utilities/index';
import useFeatureFlag from '../../Utilities/useFeatureFlag';

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
  const isSatelliteWorkloadEnabled = useFeatureFlag(
    'hbi.ui.workload_filter_satellite',
  );

  const workloadValue = dispatch ? state.workloadFilter : workloadStateValue;

  const setValue = dispatch
    ? (newValue) => dispatch({ type: WORKLOAD_FILTER, payload: newValue })
    : setStateValue;

  const activeOptions = isSatelliteWorkloadEnabled
    ? workloadOptions
    : workloadOptions.filter(({ value }) => value !== 'satellite');

  const filter = {
    label: 'Workload',
    value: 'workloads',
    type: 'checkbox',
    filterValues: {
      value: workloadValue,
      onChange: (_e, value) => setValue(value),
      items: activeOptions,
      placeholder: 'Filter by workload',
    },
  };

  const chip =
    workloadValue?.length > 0
      ? [
          {
            category: 'Workload',
            type: WORKLOAD_FILTER_KEY,
            chips: activeOptions
              .filter(({ value }) => workloadValue.includes(value))
              .map(({ label, value }) => ({ name: label, value })),
          },
        ]
      : [];

  return [filter, chip, workloadValue, setValue];
};
