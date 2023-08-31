/* eslint-disable camelcase */
import { act, renderHook } from '@testing-library/react-hooks';
import useGroupFilter from './useGroupFilter';

jest.mock('../../Utilities/useFeatureFlag', () => ({
  __esModule: true,
  default: () => true,
}));

jest.mock('../InventoryGroups/utils/api', () => ({
  __esModule: true,
  getGroups: () =>
    new Promise((resolve) =>
      resolve({
        total: 10,
      })
    ),
}));

jest.mock('../../Utilities/hooks/useFetchBatched', () => ({
  __esModule: true,
  default: () => ({
    fetchBatched: () =>
      new Promise((resolve) => resolve([{ results: [{ name: 'group-1' }] }])),
  }),
}));

describe('useGroupFilter', () => {
  describe('with groups yet not loaded', () => {
    it('should return empty state value', () => {
      const { result } = renderHook(useGroupFilter);
      expect(result.current).toMatchSnapshot();
    });
  });

  describe('with groups loaded', () => {
    it('should return correct chips array, current value and value setter', () => {
      const { result } = renderHook(useGroupFilter);
      const [, chips, value, setValue] = result.current;
      expect(chips.length).toBe(0);
      expect(value.length).toBe(0);
      act(() => {
        setValue(['nisi ut consequat ad1']);
      });
      const [, chipsUpdated, valueUpdated] = result.current;
      expect(chipsUpdated.length).toBe(1);
      expect(valueUpdated).toEqual(['nisi ut consequat ad1']);
      expect(chipsUpdated).toMatchSnapshot();
    });
  });
});
