import { act, renderHook, waitFor } from '@testing-library/react';
import { mockSystemProfile } from '../../__mocks__/hostApi';
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
    mockSystemProfile.onGet().replyOnce(200);
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
        useOperatingSystemFilter(undefined, [], true, true)
      );
      expect(result.current).toMatchSnapshot();
    });
  });

  describe('with operating systems loaded', () => {
    it('should return correct filter config', () => {
      const { result } = renderHook(() =>
        useOperatingSystemFilter(undefined, [], true, true)
      );
      const [config] = result.current;
      expect(config.filterValues.groups.length).toBe(5);
      expect(config.label).toBe('Operating system'); // should be all caps
      expect(config.type).toBe('group');
    });

    it('should return correct chips array, current value and value setter', () => {
      const { result } = renderHook(() =>
        useOperatingSystemFilter(undefined, [], true, true)
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

  describe('with custom operating system fetch endpoint', () => {
    it('Should use the provided custom fetch function', async () => {
      const fetchCustomOSes = jest.fn(
        Promise.resolve({
          operatingSystems,
          operatingSystemsLoaded: true,
        })
      );

      renderHook(() =>
        useOperatingSystemFilter(undefined, [], true, true, fetchCustomOSes)
      );

      await waitFor(() =>
        expect(useFetchOperatingSystems).toHaveBeenCalledWith(
          expect.objectContaining({ fetchCustomOSes })
        )
      );
    });
  });
});
