import { renderHook, act } from '@testing-library/react-hooks';
import { useOperatingSystemFilter } from './useOperatingSystemFilter';

describe('useOperatingSystemFilter', () => {
    it('should create filter', () => {
        const { result } = renderHook(() => useOperatingSystemFilter([
            {
                label: 'RHEL 8.0',
                value: '8.0'
            },
            {
                label: 'RHEL 8.4',
                value: '8.4'
            },
            {
                label: 'RHEL 8.3',
                value: '8.3'
            },
            {
                label: 'RHEL 9.0',
                value: '9.0'
            }
        ], true));

        expect(result.current[0]).toMatchSnapshot();
    });

    it('should create chip', () => {
        const { result } = renderHook(() => useOperatingSystemFilter([
            {
                label: 'RHEL 8.0',
                value: '8.0'
            },
            {
                label: 'RHEL 8.4',
                value: '8.4'
            },
            {
                label: 'RHEL 8.3',
                value: '8.3'
            },
            {
                label: 'RHEL 9.0',
                value: '9.0'
            }
        ], true));
        expect(result.current[1]).toMatchSnapshot();

        act(() => {
            result.current[3]({ '8.0': { 8.4: true } });
        });

        expect(result.current[1]).toMatchSnapshot();
    });
});
