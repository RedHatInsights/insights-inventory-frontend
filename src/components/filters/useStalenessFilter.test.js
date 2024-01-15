import { act, renderHook } from '@testing-library/react-hooks';
import { staleness } from '../../Utilities';
import { useStalenessFilter } from './useStalenessFilter';

describe('useStalenessFilter', () => {
  it('should create filter', () => {
    const { result } = renderHook(() => useStalenessFilter());
    const [filter] = result.current;

    expect(filter).toMatchObject({
      label: 'Status',
      value: 'stale-status',
      type: 'checkbox',
    });
    expect(filter.filterValues.value.length).toBe(0);
    expect(filter.filterValues.items).toMatchObject(staleness);
  });

  it('should create chip', () => {
    const { result } = renderHook(() => useStalenessFilter());
    const [, , , setValue] = result.current;

    act(() => {
      setValue(['stale']);
    });
    const [filter, chip, value] = result.current;
    expect(value).toMatchObject(['stale']);
    expect(filter.filterValues.value.length).toBe(1);
    expect(chip).toMatchObject([
      {
        category: 'Status',
        chips: [{ name: 'Stale', value: 'stale' }],
        type: 'staleness',
      },
    ]);
  });
});
