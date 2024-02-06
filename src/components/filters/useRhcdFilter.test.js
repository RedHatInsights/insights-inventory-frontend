import { act, renderHook } from '@testing-library/react-hooks';
import { rhcdOptions } from '../../Utilities';
import { useRhcdFilter } from './useRhcdFilter';

describe('useRhcdFilter', () => {
  it('should create filter', () => {
    const { result } = renderHook(() => useRhcdFilter());
    const [filter] = result.current;

    expect(filter.filterValues.value.length).toBe(0);
    expect(filter.filterValues.items).toMatchObject(rhcdOptions);
  });

  it('should create chip', () => {
    const { result } = renderHook(() => useRhcdFilter());
    const [, , , setValue] = result.current;

    act(() => {
      setValue(['not_nil']);
    });
    const [filter, chip, value] = result.current;
    expect(value).toMatchObject(['not_nil']);
    expect(filter.filterValues.value.length).toBe(1);
    expect(chip).toMatchObject([
      {
        category: 'RHC status',
        chips: [{ name: 'Active', value: 'not_nil' }],
        type: 'rhc_client_id',
      },
    ]);
  });
});
