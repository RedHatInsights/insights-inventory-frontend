import { act, renderHook } from '@testing-library/react-hooks';
import { UPDATE_METHOD_KEY, updateMethodOptions } from '../../Utilities';
import { useUpdateMethodFilter } from './useUpdateMethodFilter';

jest.mock('../../Utilities/useFeatureFlag', () => ({
  __esModule: true,
  default: () => false,
}));

describe('useUpdateMethodFilter', () => {
  it('should create filter', () => {
    const { result } = renderHook(() => useUpdateMethodFilter());
    const [filter] = result.current;

    expect(filter).toMatchObject({
      label: 'System Update Method',
      value: 'update-method',
      type: 'checkbox',
    });
    expect(filter.filterValues.value.length).toBe(0);
    expect(filter.filterValues.items).toMatchObject(updateMethodOptions);
  });

  it('should create chip', () => {
    const { result } = renderHook(() => useUpdateMethodFilter());
    const [, , , setValue] = result.current;

    act(() => setValue(['yum']));
    const [filter, chip, value] = result.current;
    expect(value).toMatchObject(['yum']);
    expect(filter.filterValues.value.length).toBe(1);
    expect(chip).toMatchObject([
      {
        category: 'System Update Method',
        chips: [{ name: 'yum', value: 'yum' }],
        type: UPDATE_METHOD_KEY,
      },
    ]);
  });
});
