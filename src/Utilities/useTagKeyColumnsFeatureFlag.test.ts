import { renderHook } from '@testing-library/react';
import useFeatureFlag from './useFeatureFlag';
import useTagKeyColumnsFeatureFlag from './useTagKeyColumnsFeatureFlag';

jest.mock('./useFeatureFlag', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedUseFeatureFlag = useFeatureFlag as jest.Mock;

describe('useTagKeyColumnsFeatureFlag', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedUseFeatureFlag.mockReset();
  });

  it('reads hbi.ui.tag-key-columns from Unleash', () => {
    mockedUseFeatureFlag.mockReturnValue(true);

    const { result } = renderHook(() => useTagKeyColumnsFeatureFlag());

    expect(mockedUseFeatureFlag).toHaveBeenCalledWith('hbi.ui.tag-key-columns');
    expect(result.current).toBe(true);
  });

  it('stays off while Unleash has not loaded and there is no local override', () => {
    mockedUseFeatureFlag.mockReturnValue(undefined);

    const { result } = renderHook(() => useTagKeyColumnsFeatureFlag());

    expect(result.current).toBe(false);
  });

  it('turns on from localStorage when Unleash is off', () => {
    mockedUseFeatureFlag.mockReturnValue(false);
    localStorage.setItem('hbi.ui.tag-key-columns', 'true');

    const { result } = renderHook(() => useTagKeyColumnsFeatureFlag());

    expect(result.current).toBe(true);
  });
});
