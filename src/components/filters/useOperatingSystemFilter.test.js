import { renderHook, act } from '@testing-library/react-hooks';
import { useOperatingSystemFilter } from './useOperatingSystemFilter';

describe('useOperatingSystemFilter', () => {
    it('should create filter', () => {
        const { result } = renderHook(() => useOperatingSystemFilter());

        expect(result.current[0]).toMatchSnapshot();
    });

    it('should create chip', () => {
        const { result } = renderHook(() => useOperatingSystemFilter());
        expect(result.current[1]).toMatchSnapshot();

        act(() => {
            result.current[3]({ '8.0': { 8.4: true } });
        });

        expect(result.current[1]).toMatchSnapshot();
    });
});
