import { act, renderHook, waitFor } from '@testing-library/react';
import { mock } from '../../__mocks__/hostApi';
import useFetchOperatingSystems from '../../Utilities/hooks/useFetchOperatingSystems';
import { buildOperatingSystems } from '../../__factories__/operatingSystems';
import { useOperatingSystemFilter } from './useOperatingSystemFilter';
jest.mock('../../Utilities/hooks/useFetchOperatingSystems');

describe('useOperatingSystemFilter', () => {
  const operatingSystems = [
    ...buildOperatingSystems(20, { osName: 'RHEL', major: 7 }),
    ...buildOperatingSystems(20, { osName: 'RHEL', major: 8 }),
    ...buildOperatingSystems(20, { osName: 'RHEL', major: 9 }),
    ...buildOperatingSystems(20, { osName: 'CentOS Linux', major: 7 }),
    ...buildOperatingSystems(20, { osName: 'CentOS Linux', major: 8 }),
  ];

  beforeEach(() => {
    mock.onGet().replyOnce(200);
    useFetchOperatingSystems.mockReturnValue({
      operatingSystems,
      operatingSystemsLoaded: true,
    });
  });

  describe('with operating systems yet not loaded', () => {
    it('should return empty state value', () => {
      useFetchOperatingSystems.mockReturnValue({
        operatingSystems: [],
        operatingSystemsLoaded: true,
      });
      const { result } = renderHook(() =>
        useOperatingSystemFilter(undefined, [], true, true),
      );
      expect(result.current).toMatchSnapshot();
    });
  });

  describe('with operating systems loaded', () => {
    it('should return correct filter config', () => {
      const { result } = renderHook(() =>
        useOperatingSystemFilter(undefined, [], true, true),
      );
      const [config] = result.current;
      expect(config.filterValues.groups.length).toBe(5);
      expect(config.label).toBe('Operating system'); // should be all caps
      expect(config.type).toBe('group');
    });

    it('should return correct chips array, current value and value setter', () => {
      const { result } = renderHook(() =>
        useOperatingSystemFilter(undefined, [], true, true),
      );
      const [, chips, value, setValue] = result.current;
      expect(chips.length).toBe(0);
      expect(Object.keys(value).length).toBe(0);
      act(() => {
        setValue({
          'RHEL-7': {
            'RHEL-7-7.6': true,
          },
        });
      });
      const [, chipsUpdated, valueUpdated] = result.current;
      expect(chipsUpdated.length).toBe(1);
      expect(valueUpdated).toEqual({
        'RHEL-7': {
          'RHEL-7': null,
          'RHEL-7-7.6': true,
        },
      });
      expect(chipsUpdated).toMatchSnapshot();
    });
  });

  describe('major version selection', () => {
    it('should select all minor versions when clicking a major version', () => {
      const { result } = renderHook(() =>
        useOperatingSystemFilter(undefined, [], true, true),
      );
      const [config] = result.current;
      const groups = config.filterValues.groups;
      const rhel8Group = groups.find((g) => g.value === 'RHEL-8');

      act(() => {
        config.filterValues.onChange(
          {},
          {},
          undefined,
          undefined,
          'RHEL-8',
          'RHEL-8',
        );
      });

      const [, , value] = result.current;
      expect(value['RHEL-8']).toBeDefined();
      expect(value['RHEL-8']['RHEL-8']).toBe(true);
      rhel8Group.items.forEach(({ value: itemVal }) => {
        expect(value['RHEL-8'][itemVal]).toBe(true);
      });
    });

    it('should deselect entire group when clicking an already fully-selected major version', () => {
      const { result } = renderHook(() =>
        useOperatingSystemFilter(undefined, [], true, true),
      );

      act(() => {
        result.current[0].filterValues.onChange(
          {},
          {},
          undefined,
          undefined,
          'RHEL-8',
          'RHEL-8',
        );
      });

      act(() => {
        result.current[0].filterValues.onChange(
          {},
          {},
          undefined,
          undefined,
          'RHEL-8',
          'RHEL-8',
        );
      });

      const [, , value] = result.current;
      expect(value['RHEL-8']).toBeUndefined();
    });

    it('should delegate to setValue for minor version clicks', () => {
      const { result } = renderHook(() =>
        useOperatingSystemFilter(undefined, [], true, true),
      );

      act(() => {
        result.current[0].filterValues.onChange(
          {},
          { 'RHEL-8': { 'RHEL-8-8.5': true } },
          undefined,
          undefined,
          'RHEL-8',
          'RHEL-8-8.5',
        );
      });

      const [, , value] = result.current;
      expect(value['RHEL-8']).toBeDefined();
      expect(value['RHEL-8']['RHEL-8-8.5']).toBe(true);
      expect(value['RHEL-8']['RHEL-8']).toEqual(null);
    });

    it('should preserve other groups when toggling a major version', () => {
      const { result } = renderHook(() =>
        useOperatingSystemFilter(undefined, [], true, true),
      );

      act(() => {
        result.current[0].filterValues.onChange(
          {},
          { 'RHEL-7': { 'RHEL-7-7.3': true } },
          undefined,
          undefined,
          'RHEL-7',
          'RHEL-7-7.3',
        );
      });

      act(() => {
        result.current[0].filterValues.onChange(
          {},
          {},
          undefined,
          undefined,
          'RHEL-8',
          'RHEL-8',
        );
      });

      const [, , value] = result.current;
      expect(value['RHEL-7']).toBeDefined();
      expect(value['RHEL-8']).toBeDefined();
      expect(value['RHEL-8']['RHEL-8']).toBe(true);
    });
  });

  describe('with custom operating system fetch endpoint', () => {
    it('Should use the provided custom fetch function', async () => {
      const fetchCustomOSes = jest.fn(
        Promise.resolve({
          operatingSystems,
          operatingSystemsLoaded: true,
        }),
      );

      renderHook(() =>
        useOperatingSystemFilter(undefined, [], true, true, fetchCustomOSes),
      );

      await waitFor(() =>
        expect(useFetchOperatingSystems).toHaveBeenCalledWith(
          expect.objectContaining({ fetchCustomOSes }),
        ),
      );
    });
  });
});
