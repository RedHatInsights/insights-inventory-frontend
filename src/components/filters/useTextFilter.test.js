import { act, renderHook } from '@testing-library/react';
import { useTextFilter } from './useTextFilter';

describe('useTextFilter', () => {
  it('should create filter', () => {
    const { result } = renderHook(() => useTextFilter());
    const [filter] = result.current;

    expect(filter).toMatchObject({
      label: 'Name',
      value: 'name-filter',
    });
    expect(filter.filterValues.value.length).toBe(0);
    expect(filter.filterValues.placeholder).toBe('Filter by name');
  });

  it('should create chip', () => {
    const { result } = renderHook(() => useTextFilter());
    const [, , , setValue] = result.current;

    act(() => {
      setValue('test');
    });
    const [filter, chip, value] = result.current;
    expect(value).toBe('test');
    expect(filter.filterValues.value).toBe('test');
    expect(chip).toMatchObject([
      {
        category: 'Display name',
        chips: [{ name: 'test' }],
        type: 'textual',
      },
    ]);
  });
});
