import { act, renderHook } from '@testing-library/react';
import { WORKLOAD_FILTER_KEY, workloadOptions } from '../../Utilities';
import { useWorkloadFilter } from './useWorkloadFilter';

describe('useWorkloadFilter', () => {
  it('should create filter', () => {
    const { result } = renderHook(() => useWorkloadFilter());
    const [filter] = result.current;

    expect(filter.filterValues.value.length).toBe(0);
    expect(filter.filterValues.items).toMatchObject(workloadOptions);
  });

  it('should create chip', () => {
    const { result } = renderHook(() => useWorkloadFilter());
    const [, , , setValue] = result.current;

    act(() => {
      setValue(['sap']);
    });
    const [filter, chip, value] = result.current;
    expect(value).toMatchObject(['sap']);
    expect(filter.filterValues.value.length).toBe(1);
    expect(chip).toMatchObject([
      {
        category: 'Workload',
        chips: [{ name: 'SAP', value: 'sap' }],
        type: WORKLOAD_FILTER_KEY,
      },
    ]);
  });
});
